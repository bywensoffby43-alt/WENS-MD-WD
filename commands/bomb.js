// commands/bomb.js
import sender from './sender.js'

// Stockage des bombes actives
const activeBombs = new Map()

export default async function bomb(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    
    // Format: .bomb <numéro> <message> <nombre de fois>
    const targetNumber = args[0]
    const times = parseInt(args[args.length - 1])
    const bombMessage = args.slice(1, -1).join(' ')

    try {
        // Vérifier les permissions (admin uniquement)
        const isOwner = message.key.fromMe
        if (!isOwner) {
            return sender(message, client, '❌ Seul le propriétaire du bot peut utiliser cette commande !')
        }

        // Vérifier les arguments
        if (!targetNumber || !bombMessage || isNaN(times)) {
            const help = `╔══════════════════════════════════════════════════════════════════╗
║                         💣 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐄 𝐁𝐎𝐌𝐁𝐄 💣                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  📌 *Utilisation :*                                             ║
║  .bomb <numéro> <message> <nombre>                              ║
║                                                                  ║
║  💡 *Exemple :*                                                 ║
║  .bomb 50912345678 Salut 10                                     ║
║                                                                  ║
║  ⚠️ *Attention :*                                               ║
║  ▸ Commande réservée au propriétaire                            ║
║  ▸ Utilisation abusive = risque de ban                          ║
║  ▸ Maximum 50 messages par bombe                                ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD |  BY WENS DEV 💻                              ║
╚══════════════════════════════════════════════════════════════════╝`
            return sender(message, client, help)
        }

        // Limiter le nombre de messages
        if (times > 50) {
            return sender(message, client, '❌ Nombre maximum : 50 messages par bombe !')
        }

        if (times < 1) {
            return sender(message, client, '❌ Le nombre doit être supérieur à 0 !')
        }

        // Formater le numéro cible
        let targetJid = targetNumber
        if (!targetJid.includes('@')) {
            targetJid = targetJid + '@s.whatsapp.net'
        }

        // Vérifier si une bombe est déjà active sur cette cible
        if (activeBombs.has(targetJid)) {
            return sender(message, client, `⚠️ Une bombe est déjà active sur ce numéro !\n📊 ${activeBombs.get(targetJid).sent}/${activeBombs.get(targetJid).total} messages envoyés.`)
        }

        // Confirmation
        await client.sendMessage(remoteJid, {
            text: `💣 *BOMBE LANCÉE !*\n\n📱 Cible : ${targetNumber}\n💬 Message : ${bombMessage}\n🔁 Nombre : ${times}\n⏳ Démarrage dans 3 secondes...`
        }, { quoted: message })

        // Stocker la bombe
        let sentCount = 0
        let stopped = false

        activeBombs.set(targetJid, {
            total: times,
            sent: 0,
            stop: () => { stopped = true }
        })

        // Attendre 3 secondes avant de commencer
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Envoyer les messages
        for (let i = 0; i < times; i++) {
            if (stopped) break
            
            try {
                await client.sendMessage(targetJid, {
                    text: bombMessage
                })
                sentCount++
                
                // Mettre à jour le compteur
                const bombData = activeBombs.get(targetJid)
                if (bombData) bombData.sent = sentCount
                
                // Petit délai entre chaque message pour éviter le spam
                await new Promise(resolve => setTimeout(resolve, 500))
                
            } catch (err) {
                console.error('Erreur bomb:', err)
                stopped = true
            }
        }

        // Nettoyer et afficher le rapport
        activeBombs.delete(targetJid)

        const resultMessage = `╔══════════════════════════════════════════════════════════════════╗
║                         💣 𝐑𝐀𝐏𝐏𝐎𝐑𝐓 𝐃𝐄 𝐁𝐎𝐌𝐁𝐄 💣                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  📱 *Cible :* ${targetNumber}
║  💬 *Message :* ${bombMessage.substring(0, 50)}${bombMessage.length > 50 ? '...' : ''}
║  ✅ *Envoyés :* ${sentCount}/${times}
║  📊 *Taux de réussite :* ${Math.floor((sentCount/times)*100)}%
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD |  BY WENS DEV 💻                              ║
╚══════════════════════════════════════════════════════════════════╝`

        await client.sendMessage(remoteJid, { text: resultMessage }, { quoted: message })

    } catch (error) {
        console.error('Bomb error:', error)
        sender(message, client, '❌ Erreur lors de l\'exécution de la bombe')
        
        // Nettoyer en cas d'erreur
        const targetJid = targetNumber ? (targetNumber.includes('@') ? targetNumber : targetNumber + '@s.whatsapp.net') : null
        if (targetJid && activeBombs.has(targetJid)) {
            activeBombs.delete(targetJid)
        }
    }
}

// Fonction pour arrêter une bombe
export async function stopBomb(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const targetNumber = args[0]

    const isOwner = message.key.fromMe
    if (!isOwner) {
        return sender(message, client, '❌ Seul le propriétaire peut arrêter une bombe !')
    }

    if (!targetNumber) {
        return sender(message, client, '❌ Utilisation : .stopbomb <numéro>')
    }

    let targetJid = targetNumber
    if (!targetJid.includes('@')) {
        targetJid = targetJid + '@s.whatsapp.net'
    }

    const bombData = activeBombs.get(targetJid)
    if (!bombData) {
        return sender(message, client, `❌ Aucune bombe active sur ce numéro !`)
    }

    bombData.stop()
    activeBombs.delete(targetJid)

    await client.sendMessage(remoteJid, {
        text: `🛑 *BOMBE ARRÊTÉE !*\n\n📱 Cible : ${targetNumber}\n📊 ${bombData.sent}/${bombData.total} messages envoyés avant l'arrêt.`
    }, { quoted: message })
}

// Commande pour lister les bombes actives
export async function bombList(client, message) {
    const remoteJid = message.key.remoteJid
    const isOwner = message.key.fromMe
    
    if (!isOwner) {
        return sender(message, client, '❌ Seul le propriétaire peut voir cette liste !')
    }

    if (activeBombs.size === 0) {
        return sender(message, client, '📭 Aucune bombe active actuellement.')
    }

    let list = `╔══════════════════════════════════════════════════════════════════╗
║                      💣 𝐁𝐎𝐌𝐁𝐄𝐒 𝐀𝐂𝐓𝐈𝐕𝐄𝐒 💣                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║\n`

    for (const [target, data] of activeBombs) {
        const number = target.split('@')[0]
        list += `║  📱 ${number} → ${data.sent}/${data.total} messages\n`
    }

    list += `║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD |  BY WENS DEV 💻                              ║
╚══════════════════════════════════════════════════════════════════╝`

    await client.sendMessage(remoteJid, { text: list }, { quoted: message })
}
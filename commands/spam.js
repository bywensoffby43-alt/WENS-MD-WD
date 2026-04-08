import sender from './sender.js'

// Stockage des spams actifs
const activeSpams = new Map()

export default async function spam(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const subCommand = args[0]?.toLowerCase()

    try {
        // Afficher l'aide
        if (!subCommand) {
            const help = `╭─⌈ 📱 SPAM VIDE ⌋
│
│ *Utilisation:* .spam <on/off>
│
│ *Description:*
│ Envoie des messages vides chaque minute
│ pour faire vibrer le téléphone 😈
│
│ *Exemples:*
│ ▸ .spam on  → Active le spam
│ ▸ .spam off → Désactive le spam
│
│ ⚠️ *Attention:* Utilisation avec modération !
│
╰─⌊ WENS MD WD ⌉`
            return sender(message, client, help)
        }

        // ACTIVER LE SPAM
        if (subCommand === 'on') {
            // Vérifier si déjà actif
            if (activeSpams.has(remoteJid)) {
                return sender(message, client, '⚠️ Le spam est déjà actif dans ce chat !')
            }

            // Démarrer le spam
            let count = 0
            const interval = setInterval(async () => {
                try {
                    count++
                    // Envoyer un message vide (un seul espace)
                    await client.sendMessage(remoteJid, {
                        text: '‌' // Caractère invisible
                    })
                    console.log(`📱 Spam #${count} envoyé dans ${remoteJid}`)
                } catch (e) {
                    console.log('Erreur spam:', e.message)
                }
            }, 60000) // 60 secondes

            // Sauvegarder l'intervalle
            activeSpams.set(remoteJid, {
                interval,
                count: 0,
                startTime: Date.now()
            })

            await sender(message, client, '✅ Spam activé ! Un message vide sera envoyé chaque minute.')
            return
        }

        // DÉSACTIVER LE SPAM
        if (subCommand === 'off') {
            const spamData = activeSpams.get(remoteJid)
            
            if (!spamData) {
                return sender(message, client, '❌ Aucun spam actif dans ce chat !')
            }

            // Arrêter l'intervalle
            clearInterval(spamData.interval)
            activeSpams.delete(remoteJid)

            const duration = Math.floor((Date.now() - spamData.startTime) / 60000)
            await sender(message, client, `❌ Spam désactivé ! (Durée: ${duration} minutes)`)
            return
        }

        sender(message, client, '❌ Commande inconnue. Utilise .spam on/off')

    } catch (error) {
        console.error('Spam error:', error)
        sender(message, client, '❌ Erreur lors de l\'exécution')
    }
}
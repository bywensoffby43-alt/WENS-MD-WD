// commands/restart.js
import sender from './sender.js'

function getSender(message) {
    return message.key.participant || message.key.remoteJid || ''
}

function isOwnerOrSudo(client, message, approvedUsers = []) {
    if (message.key.fromMe) return true
    const sender = getSender(message)
    const owner = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const ownerLid = client.user?.lid ? client.user.lid.split(':')[0] + '@lid' : ''
    return sender === owner || sender === ownerLid || approvedUsers.includes(sender)
}

export default async function restartCommand(client, message, approvedUsers = []) {
    const remoteJid = message.key.remoteJid

    if (!isOwnerOrSudo(client, message, approvedUsers)) {
        return sender(message, client, '❌ Cette commande est réservée au propriétaire et aux sudo.')
    }

    await client.sendMessage(remoteJid, {
        text: `🔄 RESTART

━━━━━━━━━━━━━━━━━━━━━━━━

✅ Redémarrage de la connexion WhatsApp en cours...
📌 Le panel reste actif, seule la session du bot est relancée.

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
    }, { quoted: message })

    setTimeout(() => {
        if (typeof client.end === 'function') {
            client.end(new Error('Restart demandé par commande WhatsApp'))
            return
        }

        if (client.ws && typeof client.ws.close === 'function') {
            client.ws.close()
            return
        }

        client.sendMessage(remoteJid, {
            text: '⚠️ Impossible de relancer la connexion automatiquement.'
        }, { quoted: message }).catch(() => {})
    }, 1500)
}
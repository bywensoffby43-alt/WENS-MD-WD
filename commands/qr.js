// commands/qr.js
import axios from 'axios'
import sender from './sender.js'

export default async function qrCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const texte = args.join(' ')

    if (!texte) {
        const help = `📱 QR CODE GENERATOR

━━━━━━━━━━━━━━━━━━━━━━━━

📌 Utilisation : .qr <texte ou lien>

💡 Exemples :
.qr https://wa.me/50940127120
.qr Bonjour le monde
.qr https://github.com/bywensoffby43

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
        return sender(message, client, help)
    }

    await client.sendMessage(remoteJid, {
        react: { text: "📱", key: message.key }
    })

    try {
        // API gratuite pour générer des QR codes
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(texte)}`
        
        await client.sendMessage(remoteJid, {
            image: { url: qrUrl },
            caption: `📱 QR CODE GÉNÉRÉ

━━━━━━━━━━━━━━━━━━━━━━━━

📝 Contenu : ${texte}
📏 Taille : 500x500

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
        }, { quoted: message })

        await client.sendMessage(remoteJid, {
            react: { text: "✅", key: message.key }
        })

    } catch (error) {
        console.error('QR error:', error)
        sender(message, client, '❌ Erreur lors de la génération du QR code')
    }
}
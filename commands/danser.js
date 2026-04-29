// commands/danser.js
import axios from 'axios'
import sender from './sender.js'

export default async function danserCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const senderId = message.key.participant || remoteJid
    
    // Récupérer la cible (mention ou réponse)
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    const target = mentioned?.[0] || null

    await client.sendMessage(remoteJid, {
        react: { text: "💃", key: message.key }
    })

    try {
        const res = await axios.get('https://api.waifu.pics/sfw/dance', { timeout: 10000 })
        const gifUrl = res.data?.url
        
        if (!gifUrl) throw new Error('Aucun GIF')

        const senderName = '@' + senderId.split('@')[0]
        const targetName = target ? '@' + target.split('@')[0] : null

        const caption = target
            ? `💃 ${senderName} a dansé pour ${targetName} !`
            : `💃 ${senderName} a dansé !`

        await client.sendMessage(remoteJid, {
            video: { url: gifUrl },
            gifPlayback: true,
            caption: `${caption}\n\n🔥 WENS MD WD| WENS DEV`,
            mentions: target ? [senderId, target] : [senderId]
        }, { quoted: message })

    } catch (err) {
        console.error('Erreur danser:', err)
        
        // Fallback image
        try {
            const res = await axios.get('https://api.waifu.pics/sfw/dance', { timeout: 10000 })
            const imgUrl = res.data?.url
            const senderName = '@' + senderId.split('@')[0]
            const targetName = target ? '@' + target.split('@')[0] : null
            const caption = target
                ? `💃 ${senderName} a dansé pour ${targetName} !`
                : `💃 ${senderName} a dansé !`

            await client.sendMessage(remoteJid, {
                image: { url: imgUrl },
                caption: `${caption}\n\n🔥 WENS MD WD| WENS DEV`,
                mentions: target ? [senderId, target] : [senderId]
            }, { quoted: message })
        } catch(e2) {
            await client.sendMessage(remoteJid, {
                text: `💃 ${target ? `@${senderId.split('@')[0]} a dansé pour @${target.split('@')[0]} !` : `@${senderId.split('@')[0]} a dansé !`}\n\n🔥 WENS MD WD| WENS DEV`,
                mentions: target ? [senderId, target] : [senderId]
            }, { quoted: message })
        }
    }
}
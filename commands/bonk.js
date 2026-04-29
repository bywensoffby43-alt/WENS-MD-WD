// commands/bonk.js
import sender from './sender.js'

export default async function bonkCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    
    // Récupérer la cible (mention ou argument)
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    const target = mentioned?.[0] || null
    const targetName = target ? `@${target.split('@')[0]}` : (args[0] || 'quelqu\'un')

    const bonkGifs = [
        'https://media1.tenor.com/m/-lPp2yVWVU8AAAAC/bonk-dog.gif',
        'https://media1.tenor.com/m/wwWGiO_6gL0AAAAC/bonk-dog.gif',
        'https://media1.tenor.com/m/s2Z_tVqrAMMAAAAC/bonk-dog.gif',
        'https://media1.tenor.com/m/Dn9ry9YJdxIAAAAC/bonk-hammer.gif',
        'https://media1.tenor.com/m/YK8KQ6lwwHIAAAAC/bonk.gif'
    ]
    
    const randomGif = bonkGifs[Math.floor(Math.random() * bonkGifs.length)]

    const result = `🔨 BONK !

━━━━━━━━━━━━━━━━━━━━━━━━

${target !== null ? `${targetName} a reçu un coup de marteau ! 🔨` : `Tu as reçu un coup de marteau ! 🔨`}

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| BY WENS DEV`

    await client.sendMessage(remoteJid, {
        image: { url: randomGif },
        caption: result,
        mentions: target ? [target] : []
    }, { quoted: message })
}
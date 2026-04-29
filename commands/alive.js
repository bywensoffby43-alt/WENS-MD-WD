// commands/alive.js
import os from 'os'

export default async function aliveCommand(client, message) {
    const remoteJid = message.key.remoteJid

    try {
        const uptime = process.uptime()
        const hours = Math.floor(uptime / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        const seconds = Math.floor(uptime % 60)

        const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1)
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1)

        const text = `
🤖 *WENS MD WD*

━━━━━━━━━━━━━━━

📌 *Statut :* 🟢 En ligne
📦 *Version :* 1.0.0
👑 *Créateur :* The GoldenBoy

━━━━━━━━━━━━━━━

📊 *SYSTÈME*

⏱️ *Uptime :* ${hours}h ${minutes}m ${seconds}s
💾 *RAM :* ${usedRam}/${totalRam} MB

━━━━━━━━━━━━━━━

🔥 *Fonctionnalités :*
• Gestion de groupe
• Anti-link & Anti-sticker
• IA (GPT, DarkGPT)
• Téléchargements
• Quiz anime
• Et bien plus !

━━━━━━━━━━━━━━━

💡 *Tape .menu pour voir les commandes*
        `

        await client.sendMessage(remoteJid, {
            text: text
        }, { quoted: message })

    } catch (error) {
        console.error('Alive error:', error)

        await client.sendMessage(remoteJid, {
            text: "🤖 *Bot en ligne !*\n🔥 WENS MD WD"
        }, { quoted: message })
    }
}
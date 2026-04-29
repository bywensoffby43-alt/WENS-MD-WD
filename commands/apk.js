import axios from 'axios'
import sender from './sender.js'

export default async function apk(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const query = args.join(' ')

    if (!query) {
        const help = `╭─⌈ 📱 APK DOWNLOADER ⌋
│
│ *Apps disponibles:*
│ ▸ termux
│ ▸ xender
│ ▸ spotify
│ ▸ capcut
│ ▸ whatsapp
│ ▸ instagram
│ ▸ tiktok
│
│ *Utilisation:* .apk <nom>
│
╰─⌊ WENS MD WD⌉`
        return sender(message, client, help)
    }

    const apkLinks = {
        termux: 'https://github.com/termux/termux-app/releases/download/v0.118.0/termux-app_v0.118.0+github-debug_universal.apk',
        xender: 'https://archive.org/download/xender-apk/Xender.apk',
        spotify: 'https://www.apkmirror.com/wp-content/themes/APKMirror/download.php?id=337077',
        capcut: 'https://www.apkmirror.com/wp-content/themes/APKMirror/download.php?id=380745',
        whatsapp: 'https://www.whatsapp.com/android/current/WhatsApp.apk',
        instagram: 'https://www.apkmirror.com/wp-content/themes/APKMirror/download.php?id=381654',
        tiktok: 'https://www.apkmirror.com/wp-content/themes/APKMirror/download.php?id=381616'
    }

    const app = query.toLowerCase()
    
    if (!apkLinks[app]) {
        return sender(message, client, `❌ App "${query}" non trouvée\n\nApps dispo: termux, xender, spotify, capcut, whatsapp, instagram, tiktok`)
    }

    await client.sendMessage(remoteJid, {
        react: { text: "📥", key: message.key }
    })

    try {
        const response = await axios.get(apkLinks[app], {
            responseType: 'arraybuffer',
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
            }
        })

        const buffer = Buffer.from(response.data)
        const sizeMB = (buffer.length / 1024 / 1024).toFixed(1)

        await client.sendMessage(remoteJid, {
            document: buffer,
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${app}.apk`,
            caption: `✅ *${app.toUpperCase()}* (${sizeMB} MB)\n\n📱 Installe directement`
        }, { quoted: message })

        await client.sendMessage(remoteJid, {
            react: { text: "✅", key: message.key }
        })

    } catch (error) {
        console.error('APK error:', error)
        
        await client.sendMessage(remoteJid, {
            text: `⚠️ Téléchargement direct impossible\n\n📱 *${app.toUpperCase()}*\n🔗 ${apkLinks[app]}\n\nTélécharge depuis ton navigateur`
        }, { quoted: message })
    }
}
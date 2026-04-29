// commands/tovideo.js
import { downloadContentFromMessage } from 'baileys'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import sender from './sender.js'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP = path.join(__dirname, '..', 'temp')

function ensureTmp() { 
    if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true }) 
}

function cleanTmp(...files) {
    for (const f of files) {
        try { if (f && fs.existsSync(f)) fs.unlinkSync(f) } catch {}
    }
}

export default async function tovideoCommand(client, message) {
    const remoteJid = message.key.remoteJid

    // Chercher le sticker : message cité ou message direct
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const stickerMsg = quoted?.stickerMessage || message.message?.stickerMessage

    if (!stickerMsg) {
        const help = `🎬 CONVERSION STICKER → VIDÉO

━━━━━━━━━━━━━━━━━━━━━━━━

📌 Utilisation : .tovideo (en répondant à un sticker)

💡 Réponds à un sticker animé avec .tovideo
Le sticker sera converti en vidéo MP4.

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
        return sender(message, client, help)
    }

    await client.sendMessage(remoteJid, {
        react: { text: "🎬", key: message.key }
    })

    ensureTmp()
    const uid = randomUUID()
    const webpPath = path.join(TMP, `${uid}.webp`)
    const mp4Path = path.join(TMP, `${uid}.mp4`)

    try {
        // Télécharger le sticker
        const msgSource = quoted?.stickerMessage
            ? {
                key: {
                    remoteJid: remoteJid,
                    id: message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: message.message.extendedTextMessage.contextInfo.participant || '',
                    fromMe: false
                },
                message: { stickerMessage: quoted.stickerMessage }
              }
            : message

        const stream = await downloadContentFromMessage(
            msgSource.message?.stickerMessage || stickerMsg,
            'sticker'
        )
        const chunks = []
        for await (const chunk of stream) chunks.push(chunk)
        const webpBuf = Buffer.concat(chunks)
        fs.writeFileSync(webpPath, webpBuf)

        // Convertir WebP → MP4 avec ffmpeg
        await execAsync(
            `ffmpeg -y -i "${webpPath}" ` +
            `-movflags faststart -pix_fmt yuv420p ` +
            `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ` +
            `"${mp4Path}"`
        )

        if (!fs.existsSync(mp4Path) || fs.statSync(mp4Path).size < 100) {
            throw new Error('Fichier MP4 vide ou non généré')
        }

        const mp4Buf = fs.readFileSync(mp4Path)
        await client.sendMessage(remoteJid, {
            video: mp4Buf,
            mimetype: 'video/mp4',
            caption: `✅ STICKER CONVERTI EN VIDÉO

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
        }, { quoted: message })

        await client.sendMessage(remoteJid, {
            react: { text: "✅", key: message.key }
        })

    } catch (error) {
        console.error('tovideo error:', error.message)
        await client.sendMessage(remoteJid, {
            text: `❌ Impossible de convertir ce sticker.\n\nAssure-toi que c'est un sticker *animé*.\n\n🔥 GOLDEN-MD-V2 | The GoldenBoy`
        }, { quoted: message })
    } finally {
        cleanTmp(webpPath, mp4Path)
    }
}
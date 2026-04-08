// commands/anime.js
import axios from 'axios'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import sender from './sender.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ANIMU_BASE = 'https://api.some-random-api.com/animu'

function normalizeType(input) {
    const lower = (input || '').toLowerCase()
    if (lower === 'facepalm' || lower === 'face_palm') return 'face-palm'
    if (lower === 'quote' || lower === 'animu-quote' || lower === 'animuquote') return 'quote'
    return lower
}

async function convertMediaToSticker(mediaBuffer, isAnimated) {
    const tmpDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const inputExt = isAnimated ? 'gif' : 'jpg'
    const input = path.join(tmpDir, `animu_${Date.now()}.${inputExt}`)
    const output = path.join(tmpDir, `animu_${Date.now()}.webp`)
    
    fs.writeFileSync(input, mediaBuffer)

    const ffmpegCmd = isAnimated 
        ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 60 -compression_level 6 "${output}"`
        : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${output}"`

    await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (err) => (err ? reject(err) : resolve()))
    })

    let webpBuffer = fs.readFileSync(output)

    try { fs.unlinkSync(input) } catch {}
    try { fs.unlinkSync(output) } catch {}
    
    return webpBuffer
}

async function sendAnimu(client, chatId, message, type) {
    const endpoint = `${ANIMU_BASE}/${type}`
    const res = await axios.get(endpoint)
    const data = res.data || {}

    if (data.link) {
        const link = data.link
        const lower = link.toLowerCase()
        const isGifLink = lower.endsWith('.gif')
        const isImageLink = lower.match(/\.(jpg|jpeg|png|webp)$/)

        if (isGifLink || isImageLink) {
            try {
                const resp = await axios.get(link, {
                    responseType: 'arraybuffer',
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                })
                const mediaBuf = Buffer.from(resp.data)
                const stickerBuf = await convertMediaToSticker(mediaBuf, isGifLink)
                await client.sendMessage(chatId, { sticker: stickerBuf }, { quoted: message })
                return
            } catch (error) {
                console.error('Error converting media to sticker:', error)
            }
        }

        try {
            await client.sendMessage(chatId, {
                image: { url: link },
                caption: `🎌 anime: ${type}`
            }, { quoted: message })
            return
        } catch {}
    }
    
    if (data.quote) {
        await client.sendMessage(chatId, {
            text: `💬 Citation Anime\n\n"${data.quote}"`
        }, { quoted: message })
        return
    }

    await client.sendMessage(chatId, {
        text: '❌ Impossible de récupérer l\'animation.'
    }, { quoted: message })
}

export default async function animeCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const subArg = args[0] || ''
    const sub = normalizeType(subArg)

    const supported = [
        'nom', 'poke', 'cry', 'kiss', 'pat', 'hug', 'wink', 'face-palm', 'quote'
    ]

    try {
        if (!sub) {
            const help = `╭─⌈ 🎌 COMMANDE ANIME ⌋
│
│ *Utilisation:* .anime <type>
│
│ *Types disponibles:*
│ ▸ nom        → Anime "nom"
│ ▸ poke       → Anime "poke"
│ ▸ cry        → Anime "pleurer"
│ ▸ kiss       → Anime "bisou"
│ ▸ pat        → Anime "caresse"
│ ▸ hug        → Anime "câlin"
│ ▸ wink       → Anime "clin d'œil"
│ ▸ face-palm  → Anime "facepalm"
│ ▸ quote      → Citation d'anime
│
│ *Exemples:*
│ .anime kiss
│ .anime hug
│ .anime quote
│
╰─⌊ WENS MD WD⌉`
            return sender(message, client, help)
        }

        if (!supported.includes(sub)) {
            return sender(message, client, `❌ Type "${sub}" non supporté.\n\nTypes disponibles: ${supported.join(', ')}`)
        }

        await sendAnimu(client, remoteJid, message, sub)

    } catch (error) {
        console.error('Erreur anime command:', error)
        sender(message, client, '❌ Erreur lors de la récupération de l\'animation.')
    }
}
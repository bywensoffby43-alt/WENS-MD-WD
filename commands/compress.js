// commands/compress.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import zlib from 'zlib'
import sender from './sender.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TEMP_DIR = path.join(__dirname, '../temp')

// Créer le dossier temp s'il n'existe pas
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
}

// Fonction pour créer un zip simple
function createSimpleZip(fileName, content) {
    const timestamp = Math.floor(Date.now() / 1000)
    const dosTime = ((timestamp >> 16) & 0xFFFF) | ((timestamp >> 8) & 0xFFFF) << 16
    
    const header = Buffer.alloc(30)
    header.writeUInt32LE(0x04034B50, 0)
    header.writeUInt16LE(20, 4)
    header.writeUInt16LE(0, 6)
    header.writeUInt16LE(0, 8)
    header.writeUInt16LE(dosTime & 0xFFFF, 10)
    header.writeUInt16LE((dosTime >> 16) & 0xFFFF, 12)
    header.writeUInt32LE(0, 14)
    header.writeUInt32LE(content.length, 18)
    header.writeUInt32LE(content.length, 22)
    header.writeUInt16LE(fileName.length, 26)
    header.writeUInt16LE(0, 28)
    
    const nameBuffer = Buffer.from(fileName, 'utf-8')
    const data = Buffer.concat([header, nameBuffer, content])
    
    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014B50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(dosTime & 0xFFFF, 12)
    centralHeader.writeUInt16LE((dosTime >> 16) & 0xFFFF, 14)
    centralHeader.writeUInt32LE(0, 16)
    centralHeader.writeUInt32LE(content.length, 20)
    centralHeader.writeUInt32LE(content.length, 24)
    centralHeader.writeUInt16LE(fileName.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(0, 38)
    centralHeader.writeUInt32LE(0, 42)
    
    const centralData = Buffer.concat([centralHeader, nameBuffer])
    
    const eocd = Buffer.alloc(22)
    eocd.writeUInt32LE(0x06054B50, 0)
    eocd.writeUInt16LE(0, 4)
    eocd.writeUInt16LE(0, 6)
    eocd.writeUInt16LE(1, 8)
    eocd.writeUInt16LE(1, 10)
    eocd.writeUInt32LE(centralData.length, 12)
    eocd.writeUInt32LE(data.length, 16)
    eocd.writeUInt16LE(0, 20)
    
    return Buffer.concat([data, centralData, eocd])
}

export default async function compressCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const senderId = message.key.participant || remoteJid

    // Analyser les arguments
    let customFileName = null
    let format = null
    let textContent = null

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '-n' || arg === '--name') {
            customFileName = args[i + 1]
            i++
        } else if (!format && (arg === 'txt' || arg === 'js' || arg === 'zip' || arg === 'json' || arg === 'html' || arg === 'css' || arg === 'xml' || arg === 'md' || arg === 'py' || arg === 'gz')) {
            format = arg
        } else if (!textContent) {
            textContent = args.slice(i).join(' ')
            break
        }
    }

    const validFormats = ['txt', 'js', 'zip', 'json', 'html', 'css', 'xml', 'md', 'py', 'gz']

    // ========== HELP ==========
    if (!format || format === 'help') {
        const help = `🗜️ COMPRESS

━━━━━━━━━━━━━━━━━━━━━━━━

📌 Utilisation : .compress <format> [options]

📝 Formats disponibles :
txt, js, zip, json, html, css, xml, md, py, gz

💡 Exemples :
.compress txt -n message.txt (en répondant)
.compress js -n test.js console.log("test")
.compress zip -n archive.zip

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| BY WENS DEV`
        return sender(message, client, help)
    }

    if (!validFormats.includes(format)) {
        return sender(message, client, `❌ Format invalide !\n\nFormats : ${validFormats.join(', ')}`)
    }

    // Récupérer le contenu
    let content = ''
    let fileName = customFileName || `fichier_${Date.now()}.${format}`

    if (!fileName.endsWith(`.${format}`) && format !== 'zip' && format !== 'gz') {
        fileName = `${fileName}.${format}`
    }
    if (format === 'zip' && !fileName.endsWith('.zip')) {
        fileName = `${fileName}.zip`
    }
    if (format === 'gz' && !fileName.endsWith('.gz')) {
        fileName = `${fileName}.gz`
    }

    // Méthode 1: Répondre à un message
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (quotedMsg) {
        if (quotedMsg.conversation) {
            content = quotedMsg.conversation
        } else if (quotedMsg.extendedTextMessage?.text) {
            content = quotedMsg.extendedTextMessage.text
        } else if (quotedMsg.imageMessage?.caption) {
            content = quotedMsg.imageMessage.caption
        } else if (quotedMsg.videoMessage?.caption) {
            content = quotedMsg.videoMessage.caption
        }
    }

    // Méthode 2: Texte dans la commande
    if (!content && textContent) {
        content = textContent
    }

    if (!content) {
        return sender(message, client, `❌ Aucun texte à compresser !\n\n💡 Réponds à un message ou ajoute du texte dans la commande.\n\nEx: .compress js console.log("test")`)
    }

    // Créer le fichier
    const filePath = path.join(TEMP_DIR, fileName)
    fs.writeFileSync(filePath, content, 'utf-8')

    let finalFilePath = filePath
    let finalFileName = fileName
    let mimetype = `text/${format}`

    if (format === 'zip') {
        const zipBuffer = createSimpleZip(fileName.replace('.zip', '.txt'), Buffer.from(content, 'utf-8'))
        const zipPath = path.join(TEMP_DIR, fileName)
        fs.writeFileSync(zipPath, zipBuffer)
        finalFilePath = zipPath
        mimetype = 'application/zip'
    } else if (format === 'gz') {
        const gzipBuffer = zlib.gzipSync(Buffer.from(content, 'utf-8'))
        const gzPath = path.join(TEMP_DIR, fileName)
        fs.writeFileSync(gzPath, gzipBuffer)
        finalFilePath = gzPath
        mimetype = 'application/gzip'
    }

    const stats = fs.statSync(finalFilePath)
    const fileSizeKB = (stats.size / 1024).toFixed(2)

    await client.sendMessage(remoteJid, {
        document: fs.readFileSync(finalFilePath),
        fileName: finalFileName,
        mimetype: mimetype,
        caption: `🗜️ FICHIER COMPRESSÉ

━━━━━━━━━━━━━━━━━━━━━━━━

📄 Nom : ${finalFileName}
📊 Taille : ${fileSizeKB} KB
🎨 Format : ${format.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| BY WENS DEV`
    }, { quoted: message })

    // Nettoyer
    try {
        fs.unlinkSync(filePath)
        if (format === 'zip' || format === 'gz') {
            fs.unlinkSync(finalFilePath)
        }
    } catch (e) {}
}
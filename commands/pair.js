// commands/pair.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sender from './sender.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Stockage des sessions de pairing
const activePairings = new Map()

// Dossier des sessions
const SESSIONS_DIR = path.join(process.cwd(), 'sessions')

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true })
}

// Supprimer un dossier récursivement
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file)
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(folderPath)
    }
}

// Nettoyer les sessions expirées (plus de 24h)
function cleanupExpiredSessions() {
    const now = Date.now()
    const oneDayAgo = now - (24 * 60 * 60 * 1000)
    
    if (fs.existsSync(SESSIONS_DIR)) {
        fs.readdirSync(SESSIONS_DIR).forEach(folder => {
            const folderPath = path.join(SESSIONS_DIR, folder)
            try {
                const stats = fs.statSync(folderPath)
                if (stats.mtimeMs < oneDayAgo) {
                    deleteFolderRecursive(folderPath)
                    console.log(`🗑️ Nettoyé session expirée: ${folder}`)
                }
            } catch (e) {}
        })
    }
}

// Nettoyage toutes les heures
setInterval(cleanupExpiredSessions, 60 * 60 * 1000)

export default async function pairCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const phoneNumber = args[0]?.replace(/[^0-9]/g, '')

    // Vérifier les permissions (propriétaire uniquement)
    const isOwner = message.key.fromMe
    if (!isOwner) {
        return sender(message, client, '❌ Seul le propriétaire peut utiliser cette commande !')
    }

    if (!phoneNumber) {
        const help = `📱 PAIRING CODE

━━━━━━━━━━━━━━━━━━━━━━━━

📌 Utilisation : .pair <numéro>

💡 Exemple :
.pair 509XXXXXXX

⚠️ Le code sera valable 5 minutes

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WEND DEV`
        return sender(message, client, help)
    }

    if (phoneNumber.length < 10) {
        return sender(message, client, '❌ Numéro invalide ! Minimum 10 chiffres.')
    }

    // Vérifier si un pairing est déjà en cours
    if (activePairings.has(phoneNumber)) {
        const existing = activePairings.get(phoneNumber)
        if (Date.now() - existing.timestamp < 300000) {
            return sender(message, client, `⚠️ Un code de pairing a déjà été généré pour ce numéro !\n\n📱 Code: ${existing.code}\n⏱️ Valable encore ${Math.ceil((300000 - (Date.now() - existing.timestamp)) / 60000)} minutes`)
        } else {
            activePairings.delete(phoneNumber)
        }
    }

    await client.sendMessage(remoteJid, {
        react: { text: "📱", key: message.key }
    })

    await client.sendMessage(remoteJid, {
        text: `🔐 Génération du code de pairage pour +${phoneNumber}...\n⏳ Veuillez patienter...`
    }, { quoted: message })

    try {
        // Nettoyer l'ancienne session si elle existe
        const sessionPath = path.join(SESSIONS_DIR, phoneNumber)
        if (fs.existsSync(sessionPath)) {
            deleteFolderRecursive(sessionPath)
        }

        // Importer dynamiquement baileys
        const { makeWASocket, useMultiFileAuthState, Browsers } = await import('@whiskeysockets/baileys')
        const pino = (await import('pino')).default
        
        // Créer la session
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
        
        const pairingSock = makeWASocket({
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            auth: state,
            browser: Browsers.ubuntu("Chrome"),
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            markOnlineOnConnect: true
        })

        pairingSock.ev.on('connection.update', async (update) => {
            const { connection } = update
            
            if (connection === 'open') {
                console.log(`✅ Connexion établie pour +${phoneNumber}`)
                
                await client.sendMessage(remoteJid, {
                    text: `✅ Appareil connecté avec succès pour +${phoneNumber} !\n\n📱 Session sauvegardée.\n\n🔥 WENS MD WD| WENS DEV`
                }, { quoted: message })
                
                setTimeout(() => {
                    pairingSock.end()
                    activePairings.delete(phoneNumber)
                }, 5000)
            }
        })

        setTimeout(async () => {
            try {
                const code = await pairingSock.requestPairingCode(phoneNumber)
                const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code
                
                activePairings.set(phoneNumber, {
                    code: formattedCode,
                    timestamp: Date.now(),
                    sock: pairingSock
                })
                
                const resultMessage = `📱 CODE DE PAIRAGE

━━━━━━━━━━━━━━━━━━━━━━━━

🔐 Numéro : +${phoneNumber}
📋 Code : ${formattedCode}

━━━━━━━━━━━━━━━━━━━━━━━━

📌 Instructions :
1. Ouvre WhatsApp sur ton téléphone
2. Va dans Paramètres → Appareils liés
3. Appuie sur "Lier un appareil"
4. Entre le code : ${formattedCode}

⚠️ Code valable 5 minutes

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`

                await client.sendMessage(remoteJid, { text: resultMessage }, { quoted: message })
                
                setTimeout(() => {
                    if (activePairings.has(phoneNumber)) {
                        activePairings.delete(phoneNumber)
                        pairingSock.end()
                    }
                }, 300000)
                
            } catch (err) {
                console.error('Erreur pairing:', err)
                await client.sendMessage(remoteJid, {
                    text: `❌ Erreur lors de la génération du code : ${err.message}\n\n🔥 WENS MD WD | WENS DEV`
                }, { quoted: message })
                activePairings.delete(phoneNumber)
            }
        }, 3000)

        pairingSock.ev.on('creds.update', saveCreds)

    } catch (error) {
        console.error('Pair error:', error)
        await client.sendMessage(remoteJid, {
            text: `❌ Erreur : ${error.message}\n\n🔥 WENS MD WD| WENS DEV`
        }, { quoted: message })
    }
}
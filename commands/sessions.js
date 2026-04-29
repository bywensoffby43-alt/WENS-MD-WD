// commands/sessions.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sender from './sender.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SESSIONS_DIR = path.join(process.cwd(), 'sessions')

// Formater la taille du fichier
function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Obtenir la liste des sessions
function getSessions() {
    if (!fs.existsSync(SESSIONS_DIR)) {
        return []
    }
    
    const sessions = []
    const folders = fs.readdirSync(SESSIONS_DIR)
    
    for (const folder of folders) {
        const folderPath = path.join(SESSIONS_DIR, folder)
        if (fs.lstatSync(folderPath).isDirectory()) {
            const credsPath = path.join(folderPath, 'creds.json')
            let status = '❌ Invalide'
            let createdAt = null
            let size = 0
            
            if (fs.existsSync(credsPath)) {
                try {
                    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'))
                    if (creds.me?.id) {
                        status = '✅ Connecté'
                        createdAt = new Date(creds.credsUpdate || Date.now()).toLocaleString()
                    }
                } catch (e) {}
                
                // Calculer la taille du dossier
                const getSize = (p) => {
                    if (fs.lstatSync(p).isDirectory()) {
                        fs.readdirSync(p).forEach(f => getSize(path.join(p, f)))
                    } else {
                        size += fs.statSync(p).size
                    }
                }
                getSize(folderPath)
            }
            
            sessions.push({
                number: folder,
                status: status,
                createdAt: createdAt,
                size: formatFileSize(size)
            })
        }
    }
    
    return sessions
}

// Supprimer une session
function deleteSession(number) {
    const sessionPath = path.join(SESSIONS_DIR, number)
    if (fs.existsSync(sessionPath)) {
        const deleteFolderRecursive = (folderPath) => {
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
        deleteFolderRecursive(sessionPath)
        return true
    }
    return false
}

export default async function sessionsCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const subCommand = args[0]?.toLowerCase()
    const targetNumber = args[1]

    // Vérifier les permissions (propriétaire uniquement)
    const isOwner = message.key.fromMe
    if (!isOwner) {
        return sender(message, client, '❌ Seul le propriétaire peut utiliser cette commande !')
    }

    // Supprimer une session
    if (subCommand === 'delete' || subCommand === 'del') {
        if (!targetNumber) {
            return sender(message, client, '❌ Utilisation : .sessions delete <numéro>')
        }
        
        const success = deleteSession(targetNumber)
        if (success) {
            await client.sendMessage(remoteJid, {
                text: `🗑️ Session supprimée pour +${targetNumber}\n\n🔥 WENS MD WD| WENS DEV`
            }, { quoted: message })
        } else {
            return sender(message, client, `❌ Aucune session trouvée pour +${targetNumber}`)
        }
        return
    }

    // Afficher la liste des sessions
    const sessions = getSessions()

    if (sessions.length === 0) {
        return sender(message, client, '📭 Aucune session active.\n\n💡 Utilise .pair <numéro> pour connecter quelqu\'un.')
    }

    let list = `📱 SESSIONS ACTIVES

━━━━━━━━━━━━━━━━━━━━━━━━\n`

    sessions.forEach((session, i) => {
        list += `${i+1}. 📱 +${session.number}\n`
        list += `   ${session.status}\n`
        if (session.createdAt) {
            list += `   📅 Connecté : ${session.createdAt}\n`
        }
        list += `   💾 Taille : ${session.size}\n`
        if (i < sessions.length - 1) list += `\n`
    })

    list += `\n━━━━━━━━━━━━━━━━━━━━━━━━
📊 Total : ${sessions.length} session(s)

━━━━━━━━━━━━━━━━━━━━━━━━
💡 Commandes :
.sessions delete <numéro> - Supprimer une session

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`

    await client.sendMessage(remoteJid, { text: list }, { quoted: message })
}
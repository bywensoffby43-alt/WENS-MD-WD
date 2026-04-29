// commands/antidelete.js
import fs from 'fs'
import path from 'path'
import { downloadMediaMessage } from 'baileys'
import sender from './sender.js'

// ═══════════════════════════════════════
//  PARAMÈTRES PERSISTÉS
// ═══════════════════════════════════════
const DB_PATH = path.resolve('./antidelete_db.json')

function loadSettings() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
        }
    } catch {}
    return {}
}

function saveSettings(s) {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(s, null, 2)) } catch {}
}

let settings = loadSettings()

// ═══════════════════════════════════════
//  CACHE MESSAGES (antidelete)
// ═══════════════════════════════════════
const messageCache = new Map()
const MAX_CACHE = 1000

export function cacheMessage(message) {
    const id = message.key?.id
    if (!id) return
    messageCache.set(id, message)
    if (messageCache.size > MAX_CACHE) {
        messageCache.delete(messageCache.keys().next().value)
    }
}

export function getCachedMessage(id) {
    return messageCache.get(id) || null
}

// ═══════════════════════════════════════
//  CACHE STATUTS (antideletestatus)
// ═══════════════════════════════════════
const statusCache = new Map()
const MAX_STATUS_CACHE = 200

export function cacheStatus(message) {
    const id = message.key?.id
    if (!id) return
    statusCache.set(id, message)
    if (statusCache.size > MAX_STATUS_CACHE) {
        statusCache.delete(statusCache.keys().next().value)
    }
}

export function getCachedStatus(id) {
    return statusCache.get(id) || null
}

// ═══════════════════════════════════════
//  AUTO-VIEW STATUTS
// ═══════════════════════════════════════
export async function autoViewStatus(client, message) {
    if (!settings['_autoView']) return
    try {
        const senderJid = message.key.participant || message.key.remoteJid
        if (!senderJid) return

        const statusKey = {
            remoteJid: 'status@broadcast',
            id: message.key.id,
            participant: senderJid,
            fromMe: false,
        }

        await client.readMessages([statusKey])
    } catch (e) {
        console.error('autoView error:', e.message)
    }
}

// ═══════════════════════════════════════
//  AUTO-RÉACTION STATUTS
// ═══════════════════════════════════════
export async function autoReactStatus(client, message) {
    const emoji = settings['_autoReact']
    if (!emoji) return

    const senderJid = message.key.participant || message.key.remoteJid
    if (!senderJid || senderJid === 'status@broadcast') return

    try {
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'

        const statusKey = {
            remoteJid: 'status@broadcast',
            id: message.key.id,
            participant: senderJid,
            fromMe: false,
        }

        await new Promise(r => setTimeout(r, 500))

        await client.sendMessage(
            'status@broadcast',
            { react: { text: emoji, key: statusKey } },
            { statusJidList: [senderJid, botJid] }
        )
    } catch (e) {
        console.error('autoReact error:', e.message)
    }
}

// ═══════════════════════════════════════
//  COMMANDES ANTIDELETE
// ═══════════════════════════════════════
export async function handleAntiDeleteCommand(client, message) {
    const chatJid = message.key.remoteJid
    const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim().toLowerCase()
    const args = text.split(/\s+/)
    const mode = args[1]
    const action = args[2]

    if (mode === 'off') {
        delete settings[chatJid]
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: '🔴 Antidelete désactivé pour ce chat.'
        }, { quoted: message })
    }
    if (mode === 'chat' && action === 'on') {
        settings[chatJid] = 'chat'
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: '🟢 Antidelete CHAT activé !\nLes messages supprimés seront renvoyés ici.\n\nPour arrêter: .antidelete off'
        }, { quoted: message })
    }
    if (mode === 'private' && action === 'on') {
        settings[chatJid] = 'private'
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: '🟢 Antidelete PRIVÉ activé !\nLes messages supprimés seront envoyés en privé.\n\nPour arrêter: .antidelete off'
        }, { quoted: message })
    }

    const currentMode = settings[chatJid]
    return client.sendMessage(chatJid, {
        text: `📖 Utilisation de .antidelete :

• .antidelete chat on → renvoie ici dans le chat
• .antidelete private on → renvoie en privé
• .antidelete off → désactive

Statut actuel: ${currentMode ? currentMode.toUpperCase() : 'OFF'}`
    }, { quoted: message })
}

// ═══════════════════════════════════════
//  COMMANDES ANTIDELETESTATUS
// ═══════════════════════════════════════
export async function handleAntiDeleteStatusCommand(client, message) {
    const chatJid = message.key.remoteJid
    const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim().toLowerCase()
    const args = text.split(/\s+/)
    const action = args[1]

    console.log('AntideleteStatus command received:', { action, args }) // Debug

    if (action === 'on') {
        settings['_statusDelete'] = true
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: '✅ Antidelete Statut ACTIVÉ !\n\nLes statuts supprimés seront sauvegardés et envoyés en DM.'
        }, { quoted: message })
    }
    if (action === 'off') {
        settings['_statusDelete'] = false
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: '❌ Antidelete Statut DÉSACTIVÉ !'
        }, { quoted: message })
    }

    const current = settings['_statusDelete'] ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ'
    return client.sendMessage(chatJid, {
        text: `📖 UTILISATION :

.antideletestatus on  → Activer
.antideletestatus off → Désactiver

Statut actuel: ${current}`
    }, { quoted: message })
}

// ═══════════════════════════════════════
//  COMMANDES AUTO-VIEW & AUTO-REACT
// ═══════════════════════════════════════
export async function handleAutoViewCommand(client, message) {
    const chatJid = message.key.remoteJid
    const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim().toLowerCase()
    const action = text.split(/\s+/)[1]

    if (action === 'on') {
        settings['_autoView'] = true
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: '✅ Auto-view statuts ACTIVÉ !\nLe bot marquera tous les statuts comme vus.'
        }, { quoted: message })
    }
    if (action === 'off') {
        settings['_autoView'] = false
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: '❌ Auto-view statuts DÉSACTIVÉ !'
        }, { quoted: message })
    }
    const current = settings['_autoView'] ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ'
    return client.sendMessage(chatJid, {
        text: `.autoviewstatus on/off\nStatut: ${current}`
    }, { quoted: message })
}

export async function handleAutoReactCommand(client, message) {
    const chatJid = message.key.remoteJid
    const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim()
    const parts = text.split(/\s+/)
    const action = parts[1]?.toLowerCase()
    const emoji = parts[2] || '❤️'

    if (action === 'on') {
        settings['_autoReact'] = emoji
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: `✅ Auto-réaction statuts ACTIVÉE !\nLe bot réagira avec ${emoji} à chaque statut.`
        }, { quoted: message })
    }
    if (action === 'off') {
        settings['_autoReact'] = null
        saveSettings(settings)
        return client.sendMessage(chatJid, {
            text: '❌ Auto-réaction statuts DÉSACTIVÉE !'
        }, { quoted: message })
    }
    const current = settings['_autoReact'] ? `✅ ACTIVÉ (${settings['_autoReact']})` : '❌ DÉSACTIVÉ'
    return client.sendMessage(chatJid, {
        text: `.autoreactstatus on 🔥 / off\nStatut: ${current}`
    }, { quoted: message })
}

// ═══════════════════════════════════════
//  HANDLER: MESSAGE SUPPRIMÉ
// ═══════════════════════════════════════
export async function handleDeletedMessage(client, deletedKey, chatJid, ownerJid) {
    if (chatJid === 'status@broadcast' || deletedKey.remoteJid === 'status@broadcast') {
        return handleDeletedStatus(client, deletedKey, ownerJid)
    }

    const mode = settings[chatJid]
    if (!mode || mode === 'off') return

    const cached = getCachedMessage(deletedKey.id)
    if (!cached) return

    const deletedBy = deletedKey.participant || deletedKey.remoteJid
    if (deletedBy === ownerJid) return

    const senderNum = (cached.key?.participant || cached.key?.remoteJid || '').split('@')[0]
    const senderName = cached.pushName || `+${senderNum}`
    const destination = mode === 'private' ? ownerJid : chatJid

    const header = `🗑️ Message supprimé\n👤 ${senderName} (+${senderNum})\n━━━━━━━━━━━━━━━━━━\n`

    await resendContent(client, cached.message, header, destination)
}

// ═══════════════════════════════════════
//  HANDLER: STATUT SUPPRIMÉ
// ═══════════════════════════════════════
async function handleDeletedStatus(client, deletedKey, ownerJid) {
    if (!settings['_statusDelete']) return

    const cached = getCachedStatus(deletedKey.id)
    if (!cached) return

    const senderNum = (cached.key?.participant || '').split('@')[0]
    const senderName = cached.pushName || `+${senderNum}`

    const header = `🗑️ Statut supprimé détecté\n👤 ${senderName} (+${senderNum})\n━━━━━━━━━━━━━━━━━━\n`

    await resendContent(client, cached.message, header, ownerJid)
}

// ═══════════════════════════════════════
//  HANDLER: RÉPONSE À UN STATUT → SAUVEGARDER EN DM
// ═══════════════════════════════════════
export async function handleStatusReply(client, message, ownerJid) {
    const contextInfo = message.message?.extendedTextMessage?.contextInfo
    if (!contextInfo) return
    if (contextInfo.remoteJid !== 'status@broadcast') return

    const quotedId = contextInfo.stanzaId
    if (!quotedId) return

    const cachedStatus = getCachedStatus(quotedId)
    if (!cachedStatus) return

    const senderNum = (cachedStatus.key?.participant || '').split('@')[0]
    const senderName = cachedStatus.pushName || `+${senderNum}`

    const header = `💾 Statut sauvegardé\n👤 ${senderName} (+${senderNum})\n━━━━━━━━━━━━━━━━━━\n`

    await resendContent(client, cachedStatus.message, header, ownerJid)
}

// ═══════════════════════════════════════
//  HELPER: RENVOYER CONTENU
// ═══════════════════════════════════════
async function resendContent(client, msg, header, destination) {
    if (!msg) return
    try {
        if (msg.conversation || msg.extendedTextMessage?.text) {
            const text = msg.conversation || msg.extendedTextMessage?.text
            await client.sendMessage(destination, { text: header + `📝 ${text}` })

        } else if (msg.imageMessage) {
            const buf = await downloadMediaMessage({ message: msg }, 'buffer', {})
            await client.sendMessage(destination, {
                image: buf,
                caption: header + (msg.imageMessage.caption ? `📝 ${msg.imageMessage.caption}` : ''),
            })

        } else if (msg.videoMessage) {
            const buf = await downloadMediaMessage({ message: msg }, 'buffer', {})
            await client.sendMessage(destination, {
                video: buf,
                caption: header + (msg.videoMessage.caption ? `📝 ${msg.videoMessage.caption}` : ''),
            })

        } else if (msg.audioMessage) {
            const buf = await downloadMediaMessage({ message: msg }, 'buffer', {})
            await client.sendMessage(destination, { text: header })
            await client.sendMessage(destination, {
                audio: buf,
                mimetype: 'audio/mp4',
                ptt: msg.audioMessage.ptt || false,
            })

        } else if (msg.stickerMessage) {
            const buf = await downloadMediaMessage({ message: msg }, 'buffer', {})
            await client.sendMessage(destination, { text: header })
            await client.sendMessage(destination, { sticker: buf })

        } else if (msg.documentMessage) {
            const buf = await downloadMediaMessage({ message: msg }, 'buffer', {})
            await client.sendMessage(destination, {
                document: buf,
                fileName: msg.documentMessage.fileName || 'fichier',
                mimetype: msg.documentMessage.mimetype || 'application/octet-stream',
                caption: header,
            })
        }
    } catch (err) {
        console.error('resendContent error:', err.message)
    }
}

export default {
    cacheMessage,
    getCachedMessage,
    cacheStatus,
    getCachedStatus,
    autoViewStatus,
    autoReactStatus,
    handleAntiDeleteCommand,
    handleAntiDeleteStatusCommand,
    handleAutoViewCommand,
    handleAutoReactCommand,
    handleDeletedMessage,
    handleStatusReply,
}
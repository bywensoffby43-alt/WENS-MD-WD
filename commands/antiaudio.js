// commands/antiaudio.js
import sender from './sender.js'

// Stockage des configurations
const groupConfigs = new Map()

// Configuration par défaut
const defaultConfig = {
    enabled: false,
    action: 'delete', // delete, warn, kick
    maxWarnings: 3,
    deleteMessage: true,
    warningMessage: "⚠️ @user, les audios ne sont pas autorisés dans ce groupe !",
    kickMessage: "👢 @user a été expulsé pour envoi d'audio !",
    allowedUsers: [], // IDs autorisés
    audioSizeLimit: 5 // en MB
}

// Charger la config d'un groupe
function getGroupConfig(groupId) {
    if (!groupConfigs.has(groupId)) {
        groupConfigs.set(groupId, { ...defaultConfig })
    }
    return groupConfigs.get(groupId)
}

// Sauvegarder la config
function saveGroupConfig(groupId, config) {
    groupConfigs.set(groupId, config)
}

// Vérifier si un audio est autorisé
function isAudioAllowed(audioSize, config) {
    return audioSize <= config.audioSizeLimit * 1024 * 1024
}

// Fonction pour envoyer un avertissement
async function sendWarning(client, remoteJid, userId, warningCount, maxWarnings) {
    const msg = `⚠️ ANTI-AUDIO

━━━━━━━━━━━━━━━━━━━━━━━━

@${userId.split('@')[0]}, les audios ne sont pas autorisés !

Avertissement ${warningCount}/${maxWarnings}

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
    
    await client.sendMessage(remoteJid, {
        text: msg,
        mentions: [userId]
    })
}

// Fonction pour kicker un utilisateur
async function kickUser(client, remoteJid, userId) {
    try {
        await client.groupParticipantsUpdate(remoteJid, [userId], 'remove')
        await client.sendMessage(remoteJid, {
            text: `👢 @${userId.split('@')[0]} a été expulsé pour envoi d'audio !

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`,
            mentions: [userId]
        })
    } catch (e) {
        console.error('Kick error:', e)
    }
}

// COMMANDE PRINCIPALE
export default async function antiaudioCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const senderId = message.key.participant || remoteJid
    
    // Vérifier si c'est un groupe
    if (!remoteJid.endsWith('@g.us')) {
        return sender(message, client, '❌ Cette commande est uniquement pour les groupes !')
    }
    
    // Vérifier les permissions
    const groupMetadata = await client.groupMetadata(remoteJid)
    const isAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin
    
    if (!isAdmin && !message.key.fromMe) {
        return sender(message, client, '❌ Seuls les admins peuvent configurer l\'anti-audio !')
    }
    
    const config = getGroupConfig(remoteJid)
    const subCommand = args[0]?.toLowerCase()
    
    // Afficher le statut
    if (!subCommand || subCommand === 'status') {
        const status = config.enabled ? '✅ ACTIF' : '❌ INACTIF'
        const actionEmoji = {
            'delete': '🗑️',
            'warn': '⚠️',
            'kick': '👢'
        }[config.action] || '❓'
        
        const text = `🔊 ANTI-AUDIO

━━━━━━━━━━━━━━━━━━━━━━━━

Statut: ${status}
Action: ${actionEmoji} ${config.action}
Max warns: ${config.maxWarnings}
Taille max: ${config.audioSizeLimit} MB
Suppression: ${config.deleteMessage ? '✅' : '❌'}

━━━━━━━━━━━━━━━━━━━━━━━━

Commandes:
.antiaudio on/off
.antiaudio action <delete|warn|kick>
.antiaudio maxwarn <nombre>
.antiaudio maxsize <MB>
.antiaudio delmsg <on/off>

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
        
        return sender(message, client, text)
    }
    
    // ACTIVER/DÉSACTIVER
    if (subCommand === 'on') {
        config.enabled = true
        saveGroupConfig(remoteJid, config)
        return sender(message, client, '✅ Anti-audio ACTIVÉ dans ce groupe !')
    }
    
    if (subCommand === 'off') {
        config.enabled = false
        saveGroupConfig(remoteJid, config)
        return sender(message, client, '❌ Anti-audio DÉSACTIVÉ dans ce groupe !')
    }
    
    // CHANGER L'ACTION
    if (subCommand === 'action') {
        const action = args[1]?.toLowerCase()
        if (!['delete', 'warn', 'kick'].includes(action)) {
            return sender(message, client, '❌ Action doit être: delete, warn, ou kick')
        }
        config.action = action
        saveGroupConfig(remoteJid, config)
        return sender(message, client, `✅ Action changée pour: ${action}`)
    }
    
    // MAX WARNS
    if (subCommand === 'maxwarn') {
        const max = parseInt(args[1])
        if (isNaN(max) || max < 1 || max > 10) {
            return sender(message, client, '❌ Max warns doit être entre 1 et 10')
        }
        config.maxWarnings = max
        saveGroupConfig(remoteJid, config)
        return sender(message, client, `✅ Max warns: ${max}`)
    }
    
    // TAILLE MAX
    if (subCommand === 'maxsize') {
        const size = parseFloat(args[1])
        if (isNaN(size) || size < 0.1 || size > 50) {
            return sender(message, client, '❌ Taille entre 0.1MB et 50MB')
        }
        config.audioSizeLimit = size
        saveGroupConfig(remoteJid, config)
        return sender(message, client, `✅ Taille max: ${size} MB`)
    }
    
    // SUPPRESSION DU MESSAGE
    if (subCommand === 'delmsg') {
        const value = args[1]?.toLowerCase()
        if (value === 'on') {
            config.deleteMessage = true
            saveGroupConfig(remoteJid, config)
            return sender(message, client, '✅ Suppression des audios ACTIVÉE')
        } else if (value === 'off') {
            config.deleteMessage = false
            saveGroupConfig(remoteJid, config)
            return sender(message, client, '❌ Suppression des audios DÉSACTIVÉE')
        } else {
            return sender(message, client, '❌ Utilise: .antiaudio delmsg on/off')
        }
    }
    
    sender(message, client, '❌ Commande inconnue. Utilise .antiaudio pour voir les options')
}

// FONCTION DE DÉTECTION DES AUDIOS
export async function detectAudio(client, message) {
    const remoteJid = message.key.remoteJid
    if (!remoteJid?.endsWith('@g.us')) return
    
    try {
        const config = getGroupConfig(remoteJid)
        if (!config.enabled) return
        
        // Vérifier si c'est un audio
        const audioMessage = message.message?.audioMessage
        if (!audioMessage) return
        
        const senderId = message.key.participant || remoteJid
        const isBot = senderId === client.user.id
        if (isBot) return
        
        // Vérifier si l'utilisateur est admin
        const groupMetadata = await client.groupMetadata(remoteJid)
        const isAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin
        if (isAdmin) return
        
        // Vérifier la taille de l'audio
        const audioSize = audioMessage.fileLength || 0
        if (!isAudioAllowed(audioSize, config)) {
            await client.sendMessage(remoteJid, {
                text: `⚠️ Audio trop gros (${(audioSize / 1024 / 1024).toFixed(1)}MB) > ${config.audioSizeLimit}MB autorisés

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
            }, { quoted: message })
        }
        
        // Supprimer le message si configuré
        if (config.deleteMessage) {
            try {
                await client.sendMessage(remoteJid, { delete: message.key })
            } catch (e) {}
        }
        
        // Actions selon configuration
        if (config.action === 'delete') {
            await client.sendMessage(remoteJid, {
                text: `🗑️ Audio supprimé (Anti-Audio)

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
            })
        }
        else if (config.action === 'warn') {
            // Stocker les warnings (à faire avec une base de données)
            const warnKey = `${remoteJid}_${senderId}`
            // Ici tu peux implémenter un système de warns dans un fichier JSON
            await client.sendMessage(remoteJid, {
                text: `⚠️ @${senderId.split('@')[0]} a envoyé un audio (non autorisé)

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`,
                mentions: [senderId]
            })
        }
        else if (config.action === 'kick') {
            await kickUser(client, remoteJid, senderId)
        }
        
    } catch (error) {
        console.error('Detect audio error:', error)
    }
}
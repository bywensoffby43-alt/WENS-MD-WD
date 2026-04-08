// commands/rank.js - DESIGN LÉGENDAIRE
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sender from './sender.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const messageCountPath = path.join(process.cwd(), 'data', 'messageCount.json')
const ranksPath = path.join(process.cwd(), 'data', 'ranks.json')

// Charger les données
function loadMessageCount() {
    try {
        if (!fs.existsSync(messageCountPath)) return {}
        return JSON.parse(fs.readFileSync(messageCountPath, 'utf8'))
    } catch {
        return {}
    }
}

function loadRanks() {
    try {
        if (!fs.existsSync(ranksPath)) return {}
        return JSON.parse(fs.readFileSync(ranksPath, 'utf8'))
    } catch {
        return {}
    }
}

function saveRanks(data) {
    const dir = path.dirname(ranksPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(ranksPath, JSON.stringify(data, null, 2))
}

// Niveaux et XP requis - DESIGN LÉGENDAIRE
const levels = [
    { level: 1, name: "🌱 𝐀𝐏𝐏𝐑𝐄𝐍𝐓𝐈", emoji: "🌱", xpRequired: 0, color: "🟢", title: "Débutant" },
    { level: 2, name: "⚡ 𝐄́𝐋𝐄̀𝐕𝐄", emoji: "⚡", xpRequired: 50, color: "🔵", title: "Élève" },
    { level: 3, name: "🔥 𝐆𝐔𝐄𝐑𝐑𝐈𝐄𝐑", emoji: "🔥", xpRequired: 150, color: "🟠", title: "Guerrier" },
    { level: 4, name: "💎 𝐄𝐋𝐈𝐓𝐄", emoji: "💎", xpRequired: 300, color: "💜", title: "Élite" },
    { level: 5, name: "👑 𝐌𝐀𝐒𝐓𝐄𝐑", emoji: "👑", xpRequired: 500, color: "💛", title: "Maître" },
    { level: 6, name: "🌟 𝐆𝐑𝐀𝐍𝐃 𝐌𝐀𝐒𝐓𝐄𝐑", emoji: "🌟", xpRequired: 750, color: "✨", title: "Grand Maître" },
    { level: 7, name: "⚜️ 𝐋𝐄́𝐆𝐄𝐍𝐃𝐄", emoji: "⚜️", xpRequired: 1000, color: "🏆", title: "Légende" },
    { level: 8, name: "💀 𝐒𝐄𝐈𝐆𝐍𝐄𝐔𝐑", emoji: "💀", xpRequired: 1500, color: "🌙", title: "Seigneur" },
    { level: 9, name: "🐉 𝐃𝐈𝐄𝐔", emoji: "🐉", xpRequired: 2000, color: "⭐", title: "Divinité" },
    { level: 10, name: "👑 𝐔𝐋𝐓𝐈𝐌𝐄", emoji: "👑", xpRequired: 3000, color: "💠", title: "Ultime" }
]

// Obtenir le niveau en fonction du nombre de messages
function getRank(messageCount) {
    let currentLevel = levels[0]
    
    for (let i = levels.length - 1; i >= 0; i--) {
        if (messageCount >= levels[i].xpRequired) {
            currentLevel = levels[i]
            break
        }
    }
    
    const currentIndex = levels.findIndex(l => l.level === currentLevel.level)
    const nextLevel = levels[currentIndex + 1]
    
    let progress = 0
    let xpNeeded = 0
    let xpCurrent = messageCount - currentLevel.xpRequired
    
    if (nextLevel) {
        xpNeeded = nextLevel.xpRequired - currentLevel.xpRequired
        progress = Math.floor((xpCurrent / xpNeeded) * 100)
        if (progress > 100) progress = 100
    } else {
        progress = 100
        xpCurrent = messageCount - currentLevel.xpRequired
        xpNeeded = messageCount
    }
    
    return {
        level: currentLevel.level,
        name: currentLevel.name,
        emoji: currentLevel.emoji,
        color: currentLevel.color,
        title: currentLevel.title,
        xp: messageCount,
        xpCurrent: xpCurrent,
        xpNeeded: xpNeeded,
        progress: progress,
        nextLevelName: nextLevel ? nextLevel.name : "⚜️ 𝐋𝐄́𝐆𝐄𝐍𝐃𝐄 𝐒𝐔𝐏𝐑𝐄̂𝐌𝐄",
        nextLevelEmoji: nextLevel ? nextLevel.emoji : "🏆"
    }
}

// Récupérer le classement
function getLeaderboard(chatId, participants, limit = 10) {
    const messageData = loadMessageCount()
    const groupData = messageData[chatId] || {}
    
    const leaderboard = participants
        .filter(p => groupData[p.id] > 0)
        .map(p => ({
            jid: p.id,
            name: p.id.split('@')[0],
            messages: groupData[p.id] || 0,
            isAdmin: !!p.admin,
            rank: getRank(groupData[p.id] || 0)
        }))
        .sort((a, b) => b.messages - a.messages)
        .slice(0, limit)
    
    return leaderboard
}

// ==================== COMMANDE PRINCIPALE ====================
export default async function rankCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const senderId = message.key.participant || remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const subCommand = args[0]?.toLowerCase()

    try {
        if (!remoteJid.endsWith('@g.us')) {
            return sender(message, client, '❌ Cette commande ne fonctionne que dans les groupes.')
        }

        const groupMetadata = await client.groupMetadata(remoteJid)
        const participants = groupMetadata.participants
        const messageData = loadMessageCount()
        const groupData = messageData[remoteJid] || {}

        // ========== CLASSEMENT LÉGENDAIRE ==========
        if (subCommand === 'top' || subCommand === 'leaderboard') {
            const leaderboard = getLeaderboard(remoteJid, participants, 10)
            
            if (leaderboard.length === 0) {
                return sender(message, client, '❌ Aucun classement disponible pour le moment. Envoyez des messages !')
            }

            let text = `╔══════════════════════════════════════════════════════════════════╗
║                    🏆 𝐂𝐋𝐀𝐒𝐒𝐄𝐌𝐄𝐍𝐓 𝐋𝐄́𝐆𝐄𝐍𝐃𝐀𝐈𝐑𝐄 🏆                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║\n`

            leaderboard.forEach((user, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📌'
                const adminBadge = user.isAdmin ? ' 👑' : ''
                text += `║  ${medal} ${user.rank.emoji} @${user.name}${adminBadge}  →  ${user.rank.name}\n`
            })

            text += `║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  📊 𝐂𝐥𝐚𝐬𝐬𝐞𝐦𝐞𝐧𝐭 𝐛𝐚𝐬𝐞́ 𝐬𝐮𝐫 ${participants.length} 𝐦𝐞𝐦𝐛𝐫𝐞𝐬                         ║
║  🌹🥃 WENS MD WD|  BY WENS HACKING 🌹🥃                              ║
╚══════════════════════════════════════════════════════════════════╝`

            await client.sendMessage(remoteJid, { 
                text, 
                mentions: leaderboard.map(u => u.jid) 
            }, { quoted: message })
            return
        }

        // ========== MON RANG LÉGENDAIRE ==========
        let targetId = senderId
        
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            targetId = message.message.extendedTextMessage.contextInfo.mentionedJid[0]
        }
        
        if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            targetId = message.message.extendedTextMessage.contextInfo.participant
        }

        const userMessages = groupData[targetId] || 0
        const rankInfo = getRank(userMessages)
        
        const targetInGroup = participants.find(p => p.id === targetId)
        if (!targetInGroup) {
            return sender(message, client, '❌ Cette personne n\'est pas dans le groupe.')
        }

        const isTargetAdmin = !!targetInGroup.admin
        const targetName = targetId.split('@')[0]
        const isSelf = targetId === senderId

        // Barre de progression stylée
        const barLength = 25
        const filledBars = Math.floor((rankInfo.progress / 100) * barLength)
        const emptyBars = barLength - filledBars
        const progressBar = '▓'.repeat(filledBars) + '░'.repeat(emptyBars)

        // Décorations selon le niveau
        const topDecor = rankInfo.level >= 7 ? '✨' : rankInfo.level >= 4 ? '🌟' : '⚡'
        
        const rankMessage = `╔══════════════════════════════════════════════════════════════════╗
║${topDecor}${topDecor}${topDecor}        ${isSelf ? '📊 𝐌𝐎𝐍 𝐑𝐀𝐍𝐆 𝐋𝐄́𝐆𝐄𝐍𝐃𝐀𝐈𝐑𝐄' : '👤 𝐑𝐀𝐍𝐆 𝐃𝐔 𝐌𝐄𝐌𝐁𝐑𝐄'}        ${topDecor}${topDecor}${topDecor}║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  👤 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐞𝐮𝐫 : @${targetName}${isTargetAdmin ? ' 👑' : ''}
║                                                                  ║
║  ${rankInfo.emoji} ${rankInfo.color} 𝐍𝐢𝐯𝐞𝐚𝐮 ${rankInfo.level} : ${rankInfo.name} ${rankInfo.emoji}
║  📜 𝐓𝐢𝐭𝐫𝐞 : ${rankInfo.title}
║                                                                  ║
║  📊 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬𝐢𝐨𝐧 : ${progressBar} ${rankInfo.progress}%
║  💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬 : ${userMessages}
║  🎯 ${rankInfo.nextLevelEmoji} 𝐏𝐫𝐨𝐜𝐡𝐚𝐢𝐧 𝐧𝐢𝐯𝐞𝐚𝐮 : ${rankInfo.nextLevelName}
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🌹🥃 WENS MD WD |  BY WENS HACKING 🌹🥃                             ║
╚══════════════════════════════════════════════════════════════════╝`

        await client.sendMessage(remoteJid, { 
            text: rankMessage, 
            mentions: [targetId] 
        }, { quoted: message })

    } catch (error) {
        console.error('Erreur rank:', error)
        sender(message, client, '❌ Impossible d\'afficher le classement.')
    }
}
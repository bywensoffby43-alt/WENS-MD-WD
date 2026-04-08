// commands/inactif.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sender from './sender.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const messageCountPath = path.join(process.cwd(), 'data', 'messageCount.json')

function loadMessageCount() {
    try {
        if (!fs.existsSync(messageCountPath)) return {}
        return JSON.parse(fs.readFileSync(messageCountPath, 'utf8'))
    } catch {
        return {}
    }
}

export default async function inactifCommand(client, message) {
    const remoteJid = message.key.remoteJid

    try {
        if (!remoteJid.endsWith('@g.us')) {
            return sender(message, client, '❌ Cette commande ne fonctionne que dans les groupes.')
        }

        await client.sendMessage(remoteJid, {
            text: '⏳ Recherche des membres inactifs...'
        }, { quoted: message })

        const groupMetadata = await client.groupMetadata(remoteJid)
        const participants = groupMetadata.participants
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'

        const data = loadMessageCount()
        const groupData = data[remoteJid] || {}

        const inactifs = participants.filter(p => {
            if (p.id === botJid) return false
            return !groupData[p.id] || groupData[p.id] === 0
        })

        if (inactifs.length === 0) {
            return sender(message, client, '✅ Aucun membre inactif ! Tous les membres ont envoyé au moins un message.')
        }

        const mentions = inactifs.map(p => p.id)
        
        let text = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              💀 𝕀ℕ𝔸ℂ𝕋𝕀𝔽 💀                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ⚰️ 𝕄𝕖𝕞𝕓𝕣𝕖𝕤 𝕢𝕦𝕚 𝕟'𝕠𝕟𝕥 𝕛𝕒𝕞𝕒𝕚𝕤 𝕖́𝕔𝕣𝕚𝕥  ⚰️      ┃
┃                                                     ┃\n`

        inactifs.forEach((p, i) => {
            const number = p.id.split('@')[0]
            const role = p.admin ? '👑 𝔄𝔡𝔪𝔦𝔫' : '💀 𝔐𝔢𝔪𝔟𝔯𝔢'
            text += `┃  ${i + 1}. @${number}  →  ${role}\n`
        })

        text += `┃                                                     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📊 𝕋𝕠𝕥𝕒𝕝: ${inactifs.length}/${participants.length} 𝕚𝕟𝕒𝕔𝕥𝕚𝕗𝕤               ┃
┃  🌹🥃 WENS MD WD |  BY WENS HACKING 🌹🥃           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`

        await client.sendMessage(remoteJid, { text, mentions }, { quoted: message })

    } catch (error) {
        console.error('Erreur inactif:', error)
        sender(message, client, '❌ Impossible d\'afficher les membres inactifs.')
    }
}
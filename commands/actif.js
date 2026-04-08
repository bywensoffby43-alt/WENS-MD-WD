// commands/actif.js - Version DARK
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sender from './sender.js'
import { getTopActifs } from '../utils/messageCounter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function actifCommand(client, message) {
    const remoteJid = message.key.remoteJid

    try {
        if (!remoteJid.endsWith('@g.us')) {
            return sender(message, client, '❌ Cette commande ne fonctionne que dans les groupes.')
        }

        await client.sendMessage(remoteJid, {
            text: '⏳ Calcul des membres les plus actifs...'
        }, { quoted: message })

        const groupMetadata = await client.groupMetadata(remoteJid)
        const participants = groupMetadata.participants
        
        global.botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'

        const actifs = getTopActifs(remoteJid, participants, 15)

        if (actifs.length === 0) {
            return sender(message, client, '❌ Aucune activité enregistrée dans ce groupe.\n\n💡 Envoyez des messages pour apparaître dans le classement !')
        }

        const medals = ['🥇', '🥈', '🥉']
        const mentions = actifs.map(m => m.jid)

        let text = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              🔥 𝔸ℂ𝕋𝕀𝔽 🔥                        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🏆 𝕄𝔼𝕄𝔹ℝ𝔼𝕊 𝕃𝔼𝕊 ℙ𝕌𝕊 𝔸ℂ𝕋𝕀𝔽𝕊 🏆                ┃
┃                                                     ┃\n`

        actifs.forEach((m, i) => {
            const number = m.jid.split('@')[0]
            const medal = medals[i] || `${i + 1}.`
            const role = m.isAdmin ? ' 👑' : ''
            text += `┃  ${medal} @${number}${role}  →  ${m.count} messages\n`
        })

        text += `┃                                                     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📊 ℂ𝕝𝕒𝕤𝕤𝕖𝕞𝕖𝕟𝕥 𝕤𝕦𝕣 ${participants.length} 𝕞𝕖𝕞𝕓𝕣𝕖𝕤               ┃
┃  🌹 WENS-MD-WD  |  WENS HACKING 🌹🥃           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`

        await client.sendMessage(remoteJid, { text, mentions }, { quoted: message })

    } catch (error) {
        console.error('Erreur actif:', error)
        sender(message, client, '❌ Impossible d\'afficher les membres actifs.')
    }
}
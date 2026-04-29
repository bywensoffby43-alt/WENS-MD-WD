// commands/groupinfo.js
import sender from './sender.js'

export default async function groupinfo(client, message) {
    const remoteJid = message.key.remoteJid

    try {
        // Vérifier si c'est un groupe
        if (!remoteJid.endsWith('@g.us')) {
            return sender(message, client, '❌ Cette commande fonctionne uniquement dans les groupes.')
        }

        const metadata = await client.groupMetadata(remoteJid)
        const name = metadata.subject || 'Sans nom'
        const desc = metadata.desc || 'Aucune description'
        const members = metadata.participants
        const admins = members.filter(p => p.admin)
        const owner = members.find(p => p.admin === 'superadmin')
        const created = metadata.creation 
            ? new Date(metadata.creation * 1000).toLocaleString('fr-FR') 
            : 'Inconnue'
        
        // Récupérer le lien d'invitation
        let inviteCode = null
        try {
            inviteCode = await client.groupInviteCode(remoteJid)
        } catch (e) {
            console.log('Impossible de récupérer le lien')
        }

        const adminList = admins.length 
            ? admins.map(p => `  • @${p.id.split('@')[0]}`).join('\n') 
            : '  • Aucun admin trouvé'

        const result = `📊 INFOS GROUPE

━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ Nom : ${name}
🆔 ID : ${remoteJid.replace('@g.us', '')}
📅 Créé le : ${created}
👑 Créateur : ${owner ? '@' + owner.id.split('@')[0] : 'Inconnu'}

━━━━━━━━━━━━━━━━━━━━━━━━

👥 Membres : ${members.length}
👑 Admins (${admins.length}) :
${adminList}

━━━━━━━━━━━━━━━━━━━━━━━━

📜 Description :
${desc}
${inviteCode ? `\n🔗 Lien : https://chat.whatsapp.com/${inviteCode}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`

        // Envoyer avec mentions des admins
        await client.sendMessage(remoteJid, {
            text: result,
            mentions: admins.map(p => p.id)
        }, { quoted: message })

    } catch (error) {
        console.error('Groupinfo error:', error)
        sender(message, client, '❌ Erreur lors de la récupération des infos du groupe')
    }
}
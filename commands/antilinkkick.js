import configmanager from '../utils/configmanager.js'
import sender from './sender.js'

export default async function antilinkkick(client, message) {
    const remoteJid = message.key.remoteJid
    const number = client.user.id.split(':')[0]
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)

    try {
        // Vérifier groupe
        if (!remoteJid.endsWith('@g.us')) {
            return sender(message, client, '❌ Anti-link uniquement pour les groupes !')
        }

        // Vérifier admin
        const metadata = await client.groupMetadata(remoteJid)
        const senderId = message.key.participant || remoteJid
        const isAdmin = metadata.participants.find(p => p.id === senderId)?.admin
        
        if (!isAdmin && !message.key.fromMe) {
            return sender(message, client, '❌ Seuls les admins peuvent configurer l\'anti-link !')
        }

        // Initialiser config
        if (!configmanager.config.users[number]) {
            configmanager.config.users[number] = {}
        }
        if (!configmanager.config.users[number].antilinkkick) {
            configmanager.config.users[number].antilinkkick = {}
        }
        if (!configmanager.config.users[number].antilinkkick[remoteJid]) {
            configmanager.config.users[number].antilinkkick[remoteJid] = {
                enabled: false,
                action: 'kick'
            }
        }

        const settings = configmanager.config.users[number].antilinkkick[remoteJid]

        // Afficher status si pas d'arguments
        if (args.length === 0 || args[0] === 'status') {
            const status = settings.enabled ? '✅ ACTIF' : '❌ INACTIF'
            const text = `╭─⌈ 🔗 ANTI-LINK KICK ⌋
│
│ Statut: ${status}
│ Action: ${settings.action === 'kick' ? '👢 KICK' : '⚠️ WARN'}
│
│ Commandes:
│ .antilinkkick on
│ .antilinkkick off
│ .antilinkkick action <kick|warn>
│
╰─⌊ GOLDEN-MD-V2 ⌉`
            return sender(message, client, text)
        }

        const subCommand = args[0].toLowerCase()

        // ACTIVER
        if (subCommand === 'on') {
            settings.enabled = true
            configmanager.save()
            await sender(message, client, '🔗 Anti-link ACTIVÉ dans ce groupe !')
            return
        }

        // DÉSACTIVER
        if (subCommand === 'off') {
            settings.enabled = false
            configmanager.save()
            await sender(message, client, '🔗 Anti-link DÉSACTIVÉ dans ce groupe !')
            return
        }

        // CHANGER L'ACTION
        if (subCommand === 'action') {
            const action = args[1]?.toLowerCase()
            if (action === 'kick') {
                settings.action = 'kick'
                configmanager.save()
                await sender(message, client, '✅ Action: KICK (expulsion directe)')
            } else if (action === 'warn') {
                settings.action = 'warn'
                configmanager.save()
                await sender(message, client, '✅ Action: WARN (avertissement)')
            } else {
                sender(message, client, '❌ Utilise: .antilinkkick action kick ou warn')
            }
            return
        }

        sender(message, client, '❌ Commande inconnue. Utilise .antilinkkick pour voir les options.')

    } catch (error) {
        console.error('Antilink error:', error)
        sender(message, client, '❌ Erreur configuration anti-link')
    }
}

// FONCTION DE DÉTECTION DES LIENS (à appeler dans messageHandler)
export async function detectLink(client, message) {
    const remoteJid = message.key.remoteJid
    if (!remoteJid?.endsWith('@g.us')) return

    try {
        const number = client.user.id.split(':')[0]
        const settings = configmanager.config.users[number]?.antilinkkick?.[remoteJid]
        
        if (!settings?.enabled) return

        // Récupérer le texte du message
        const text = (message.message?.extendedTextMessage?.text || 
                     message.message?.conversation || '').toLowerCase()
        
        if (!text) return

        // Vérifier si contient un lien
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi
        const hasLink = urlRegex.test(text)
        
        if (!hasLink) return

        // Récupérer infos utilisateur
        const senderId = message.key.participant || remoteJid
        const isBot = senderId === client.user.id
        
        if (isBot) return

        // Vérifier si c'est un admin
        const metadata = await client.groupMetadata(remoteJid).catch(() => null)
        if (metadata) {
            const isAdmin = metadata.participants.find(p => p.id === senderId)?.admin
            if (isAdmin) return
        }

        // Supprimer le message
        try {
            await client.sendMessage(remoteJid, { delete: message.key })
        } catch (e) {}

        // Action selon config
        if (settings.action === 'kick') {
            await client.groupParticipantsUpdate(remoteJid, [senderId], 'remove')
            await client.sendMessage(remoteJid, {
                text: `> _*👢 @${senderId.split('@')[0]} expulsé (Anti-Link)*_`,
                mentions: [senderId]
            })
        } else if (settings.action === 'warn') {
            await client.sendMessage(remoteJid, {
                text: `> _*⚠️ @${senderId.split('@')[0]} lien détecté et supprimé !_`,
                mentions: [senderId]
            })
        }

    } catch (error) {
        console.error('Detect link error:', error)
    }
}
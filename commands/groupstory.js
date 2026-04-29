import { downloadMediaMessage } from 'baileys'
import sender from './sender.js'

function getQuotedMessage(message) {
    return message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null
}

function getQuotedMediaType(quotedMessage) {
    if (quotedMessage?.imageMessage) return 'image'
    if (quotedMessage?.videoMessage) return 'video'
    return ''
}

export default async function groupstory(client, message) {
    const remoteJid = message.key.remoteJid

    if (!remoteJid.endsWith('@g.us')) {
        return sender(message, client, '❌ Cette commande fonctionne seulement dans les groupes.')
    }

    try {
        const groupMetadata = await client.groupMetadata(remoteJid)

        // ✅ récupérer les membres du groupe
        const participants = groupMetadata.participants.map(p => p.id)

        const quotedMessage = getQuotedMessage(message)
        const mediaType = getQuotedMediaType(quotedMessage)

        let content = {}
        const caption = `📢 STORY DU GROUPE\n\n${groupMetadata.subject}`

        if (mediaType) {
            const mediaBuffer = await downloadMediaMessage(
                { message: quotedMessage },
                'buffer',
                {}
            )

            if (!mediaBuffer) {
                return sender(message, client, '❌ Impossible de récupérer le média cité.')
            }

            if (mediaType === 'image') {
                content = {
                    image: mediaBuffer,
                    caption
                }
            }

            if (mediaType === 'video') {
                content = {
                    video: mediaBuffer,
                    caption
                }
            }
        } else {
            content = {
                text: caption
            }
        }

        // ✅ envoyer le statut aux membres du groupe
        await client.sendMessage(
            'status@broadcast',
            content,
            {
                statusJidList: participants
            }
        )

        await sender(message, client, '✅ Story du groupe publiée dans les statuts.')

    } catch (error) {
        console.log(error)
        return sender(message, client, '❌ Erreur lors de l’envoi du statut.')
    }
}
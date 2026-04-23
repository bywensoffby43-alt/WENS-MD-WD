// commands/ia.js
import axios from 'axios'
import sender from './sender.js'

const SYSTEM_PROMPT =
    'Tu es wens AI, un assistant intelligent, amical et utile intégré dans un bot WhatsApp appelé WENS MD WD. ' +
    'Réponds toujours en français sauf si l\'utilisateur t\'écrit dans une autre langue. ' +
    'Sois concis, clair et utile. Ne dépasse pas 500 mots dans ta réponse. ' +
    'Tu peux répondre à des questions générales, des conseils, des explications, de la créativité, etc.'

export default async function iaCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const query = args.join(' ').trim()

    if (!query) {
        const help = `🤖 WENS AI

━━━━━━━━━━━━━━━━━━━━━━━━

📌 Utilisation : .ia <question>

💡 Exemples :
.ia Comment faire du café ?
.ia Explique-moi les trous noirs
.ia Écris-moi un poème

━━━━━━━━━━━━━━━━━━━━━━━━
🤫WENS MD WD  | BY WENS 🥃`
        return sender(message, client, help)
    }

    await client.sendMessage(remoteJid, {
        react: { text: "🤖", key: message.key }
    })

    await client.sendMessage(remoteJid, {
        text: "🤖 WENS AI réfléchit à ta question..."
    }, { quoted: message })

    try {
        const res = await axios.post('https://text.pollinations.ai/', {
            model: 'openai',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: query.trim() }
            ],
            seed: Math.floor(Math.random() * 9999)
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        })

        let answer = ''
        if (typeof res.data === 'string') {
            answer = res.data
        } else if (res.data?.choices?.[0]?.message?.content) {
            answer = res.data.choices[0].message.content
        } else {
            answer = 'Désolé, je n\'ai pas pu générer de réponse.'
        }

        answer = answer.trim()
        
        // Tronquer si trop long
        if (answer.length > 1500) {
            answer = answer.substring(0, 1500) + '...'
        }

        const result = `🤖 WENS AI

━━━━━━━━━━━━━━━━━━━━━━━━

📝 Question : ${query}

💡 Réponse :
${answer}

━━━━━━━━━━━━━━━━━━━━━━━━
🤫WENS MD WD  | BY WENS`

        await client.sendMessage(remoteJid, { text: result }, { quoted: message })
        await client.sendMessage(remoteJid, { react: { text: "✅", key: message.key } })

    } catch (error) {
        console.error('IA error:', error)
        await client.sendMessage(remoteJid, {
            text: `❌ IA indisponible : ${error.message}\n\n🤫 WENS MD WD| BY WENS 🥃`
        }, { quoted: message })
    }
}

// Fonction pour générer des images (optionnelle)
export async function iaImage(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const query = args.join(' ').trim()

    if (!query) {
        const help = `🎨 WENS AI IMAGE

━━━━━━━━━━━━━━━━━━━━━━━━

📌 Utilisation : .iaimage <description>

💡 Exemple :
.iaimage un dragon cracheur de feu

━━━━━━━━━━━━━━━━━━━━━━━━
🤫WENS MD WD | BY WENS 🥃`
        return sender(message, client, help)
    }

    await client.sendMessage(remoteJid, {
        react: { text: "🎨", key: message.key }
    })

    await client.sendMessage(remoteJid, {
        text: "🎨 Génération d'image en cours..."
    }, { quoted: message })

    try {
        const encoded = encodeURIComponent(query)
        const seed = Math.floor(Math.random() * 99999)
        const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?seed=${seed}&nologo=true&width=768&height=768`

        await client.sendMessage(remoteJid, {
            image: { url: imageUrl },
            caption: `🎨 IMAGE GÉNÉRÉE

━━━━━━━━━━━━━━━━━━━━━━━━

📝 ${query}

━━━━━━━━━━━━━━━━━━━━━━━━
🤫WENS MD WD | BY WENS 🥃`
        }, { quoted: message })

        await client.sendMessage(remoteJid, { react: { text: "✅", key: message.key } })

    } catch (error) {
        console.error('IA Image error:', error)
        await client.sendMessage(remoteJid, {
            text: `❌ Erreur génération image : ${error.message}\n\n🤫 WENS MD WD| BY WENS 🥃`
        }, { quoted: message })
    }
}
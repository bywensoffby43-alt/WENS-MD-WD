// commands/golden.js
import axios from 'axios'
import sender from './sender.js'

// Stockage des conversations
const conversations = new Map()
const requestHistory = new Map()
const RATE_LIMIT = 15
const TIME_WINDOW = 60000

// Vérification du rate limit
function checkRateLimit(ip) {
    const now = Date.now()
    const userRequests = requestHistory.get(ip) || []
    const recentRequests = userRequests.filter(time => now - time < TIME_WINDOW)
    
    if (recentRequests.length >= RATE_LIMIT) {
        return false
    }
    
    recentRequests.push(now)
    requestHistory.set(ip, recentRequests)
    return true
}

export default async function goldenCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const query = args.join(' ')
    const userId = message.key.participant || remoteJid

    // Rate limit
    const ip = remoteJid
    if (!checkRateLimit(ip)) {
        await client.sendMessage(remoteJid, { 
            text: "⏰ Trop de requêtes ! Attends un peu avant de réessayer."
        }, { quoted: message })
        return
    }

    if (!query) {
        const help = `╭─────────────────────────────────────────────╮
│              🧠 WENS DEV AI 🧠               │
├─────────────────────────────────────────────┤
│                                             │
│  📌 Utilisation :                           │
│  .golden <question>                         │
│                                             │
│  💡 Exemples :                              │
│  .golden Quelle est la capitale de la France│
│  .golden Raconte une blague                 │
│  .golden Explique-moi la relativité         │
│                                             │
│  ⚡ Fonctionnalités :                       │
│  ▸ IA puissante (GPT-4o)                    │
│  ▸ Réponses rapides                         │
│  ▸ Gratuit et illimité                      │
│                                             │
├─────────────────────────────────────────────┤
│  🔥 WENS MD WD| WENS DEV            │
╰─────────────────────────────────────────────╯`
        await client.sendMessage(remoteJid, { text: help }, { quoted: message })
        return
    }

    // Message d'attente
    await client.sendMessage(remoteJid, { 
        text: `🧠 wens AI réfléchit à ta question...\n\n📝 "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`
    }, { quoted: message })

    try {
        // Appel API GPT-4o
        const response = await axios.get(`https://api.giftedtech.co.ke/api/ai/gpt4o?apikey=gifted&q=${encodeURIComponent(query)}`, {
            timeout: 30000
        })

        if (response.data && response.data.success && response.data.result) {
            let answer = response.data.result
            
            // Nettoyer la réponse
            answer = answer.replace(/\*/g, '')
            
            // Tronquer si trop long
            if (answer.length > 1800) {
                answer = answer.substring(0, 1800) + '...\n\n(Message tronqué)'
            }

            // Sauvegarder l'historique
            let history = conversations.get(userId) || []
            history.push({ role: 'user', content: query })
            history.push({ role: 'assistant', content: answer })
            
            if (history.length > 20) {
                history = history.slice(-20)
            }
            conversations.set(userId, history)

            const resultMessage = `╭─────────────────────────────────────────────╮
│              🧠 WENS DEV AI 🧠               │
├─────────────────────────────────────────────┤
│                                             │
│  📝 Question :                              │
│  ${query}
│                                             │
│  🤖 Réponse :                               │
│  ${answer}
│                                             │
├─────────────────────────────────────────────┤
│  🔥 WENS MD WD| WENS DEV          │
╰─────────────────────────────────────────────╯`

            await client.sendMessage(remoteJid, { text: resultMessage }, { quoted: message })

        } else {
            throw new Error("Réponse invalide de l'API")
        }

    } catch (error) {
        console.error('Erreur wens AI:', error)
        
        const errorMessage = `╭─────────────────────────────────────────────╮
│              🧠 WENS DEV AI 🧠               │
├─────────────────────────────────────────────┤
│                                             │
│  ❌ Erreur !                                │
│                                             │
│  L'IA est momentanément indisponible.      │
│  Réessaie dans quelques instants.          │
│                                             │
├─────────────────────────────────────────────┤
│  🔥 WENS MD WD| WENS DEV            │
╰─────────────────────────────────────────────╯`
        
        await client.sendMessage(remoteJid, { text: errorMessage }, { quoted: message })
    }
}

// Commande pour effacer l'historique
export async function wensClear(client, message) {
    const remoteJid = message.key.remoteJid
    const userId = message.key.participant || remoteJid
    
    conversations.delete(userId)
    
    await client.sendMessage(remoteJid, { 
        text: `🧹 Historique effacé !\n\nTes conversations avec wens AI ont été réinitialisées.`
    }, { quoted: message })
}
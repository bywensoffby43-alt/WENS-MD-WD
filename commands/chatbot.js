// commands/chatbot.js
import axios from 'axios'
import sender from './sender.js'

// Stockage des conversations, modes et statut par groupe
const conversations = new Map()
const userModes = new Map()
const groupStatus = new Map() // key: groupId, value: { enabled: boolean }

// Mots de déclenchement (salutations)
const triggerWords = ['bonjour', 'salut', 'bonsoir', 'coucou', 'hello', 'hi', 'yo', 'hey']

// ==================== APIS CHATGPT ====================
const APIS = [
    { name: 'ChatGPT4', api: 'https://stablediffusion.fr/gpt4/predict2', referer: 'https://stablediffusion.fr/chatgpt4' },
    { name: 'ChatGPT3', api: 'https://stablediffusion.fr/gpt3/predict', referer: 'https://stablediffusion.fr/chatgpt3' }
]

// ==================== PROMPTS ====================
const modePrompts = {
    normal: `Tu es Golden, un assistant amical. Parle naturellement, comme un humain. Réponds de manière simple et naturelle. Sois concis.`,
    bro: `Tu es Golden, un pote. Parle comme un mec normal. Utilise "frr" parfois. Sois naturel.`,
    girlfriend: `Tu es Golden. Parle normalement, comme une pote. Sois sympa sans être collante.`,
    boyfriend: `Tu es Golden. Parle normalement, comme un pote. Sois sympa sans être collant.`,
    ami: `Tu es Golden, un pote. Parle normalement. Sois sympa.`,
    amie: `Tu es Golden, une pote. Parle normalement. Sois sympa.`,
    boy: `Tu es Golden, tu parles à un pote. Sois naturel.`,
    girl: `Tu es Golden, tu parles à une fille. Sois naturel.`
}

// ==================== FONCTION APPEL API ====================
async function callChatGPT(prompt, modelIndex = 0) {
    const api = APIS[modelIndex]
    try {
        const refererResp = await axios.get(api.referer, {
            timeout: 8000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
        })

        const setCookie = refererResp.headers && refererResp.headers['set-cookie']
        const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : undefined

        const response = await axios.post(api.api, { prompt }, {
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'origin': 'https://stablediffusion.fr',
                'referer': api.referer,
                ...(cookieHeader ? { 'cookie': cookieHeader } : {}),
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            },
            timeout: 25000
        })

        if (response.data && response.data.message) {
            return { success: true, response: response.data.message }
        }
        return { success: false }
    } catch (error) {
        console.error(`Erreur avec ${api.name}:`, error.message)
        return { success: false }
    }
}

// ==================== FONCTION PRINCIPALE ====================
async function getAIResponse(prompt, userId = null) {
    const mode = userModes.get(userId) || 'normal'
    const modePrompt = modePrompts[mode]

    let contextPrompt = prompt
    if (userId && conversations.has(userId)) {
        const history = conversations.get(userId)
        const lastMessages = history.slice(-5)
        if (lastMessages.length > 0) {
            const historyText = lastMessages.map(m => `${m.role === 'user' ? 'Moi' : 'Golden'}: ${m.content}`).join('\n')
            contextPrompt = `${modePrompt}\n\nContexte:\n${historyText}\n\nMessage: ${prompt}\n\nRéponds simplement:`
        } else {
            contextPrompt = `${modePrompt}\n\nMessage: ${prompt}\n\nRéponds simplement:`
        }
    } else {
        contextPrompt = `${modePrompt}\n\nMessage: ${prompt}\n\nRéponds simplement:`
    }

    let result = await callChatGPT(contextPrompt, 0)
    if (!result.success) {
        result = await callChatGPT(contextPrompt, 1)
    }
    return result
}

function setUserMode(userId, mode) {
    if (modePrompts[mode]) {
        userModes.set(userId, mode)
        return true
    }
    return false
}

function getUserMode(userId) {
    return userModes.get(userId) || 'normal'
}

// ==================== GESTION DU STATUT PAR GROUPE ====================
function isChatbotEnabled(groupId) {
    return groupStatus.get(groupId) === true
}

function setChatbotEnabled(groupId, enabled) {
    if (enabled) {
        groupStatus.set(groupId, true)
    } else {
        groupStatus.set(groupId, false)
    }
}

// ==================== FONCTIONS DE DÉTECTION ====================
function isBotMentioned(messageBody, botNumber) {
    return messageBody.includes(`@${botNumber}`) || messageBody.includes(`@${botNumber.split('@')[0]}`)
}

function isGreeting(messageBody) {
    const lowerMsg = messageBody.toLowerCase()
    return triggerWords.some(word => lowerMsg === word || lowerMsg.startsWith(word + ' ') || lowerMsg.endsWith(' ' + word) || lowerMsg.includes(' ' + word + ' '))
}

// ==================== COMMANDE PRINCIPALE ====================
export default async function chatbotCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const userId = message.key.participant || remoteJid
    const subCommand = args[0]?.toLowerCase()
    const prompt = args.slice(1).join(' ')

    // Vérifier si c'est un groupe
    const isGroup = remoteJid.endsWith('@g.us')

    // GESTION ON/OFF (pour les groupes)
    if (subCommand === 'on' && isGroup) {
        setChatbotEnabled(remoteJid, true)
        await client.sendMessage(remoteJid, { text: "✅ Chatbot activé dans ce groupe !" }, { quoted: message })
        return
    }

    if (subCommand === 'off' && isGroup) {
        setChatbotEnabled(remoteJid, false)
        await client.sendMessage(remoteJid, { text: "❌ Chatbot désactivé dans ce groupe !" }, { quoted: message })
        return
    }

    // GESTION DES MODES (pour l'utilisateur)
    if (subCommand === 'on' && args[1] === 'bro') {
        setUserMode(userId, 'bro')
        await client.sendMessage(remoteJid, { text: "🍒 Mode bro activé" }, { quoted: message })
        return
    }
    if (subCommand === 'on' && args[1] === 'girlfriend') {
        setUserMode(userId, 'girlfriend')
        await client.sendMessage(remoteJid, { text: "🍒 Mode girlfriend activé" }, { quoted: message })
        return
    }
    if (subCommand === 'on' && args[1] === 'boyfriend') {
        setUserMode(userId, 'boyfriend')
        await client.sendMessage(remoteJid, { text: "🍒 Mode boyfriend activé" }, { quoted: message })
        return
    }
    if (subCommand === 'on' && args[1] === 'ami') {
        setUserMode(userId, 'ami')
        await client.sendMessage(remoteJid, { text: "🍒 Mode ami activé" }, { quoted: message })
        return
    }
    if (subCommand === 'on' && args[1] === 'amie') {
        setUserMode(userId, 'amie')
        await client.sendMessage(remoteJid, { text: "🍒 Mode amie activé" }, { quoted: message })
        return
    }
    if (subCommand === 'on' && args[1] === 'boy') {
        setUserMode(userId, 'boy')
        await client.sendMessage(remoteJid, { text: "🍒 Mode boy activé" }, { quoted: message })
        return
    }
    if (subCommand === 'on' && args[1] === 'girl') {
        setUserMode(userId, 'girl')
        await client.sendMessage(remoteJid, { text: "🍒 Mode girl activé" }, { quoted: message })
        return
    }
    if (subCommand === 'on' && !args[1]) {
        setUserMode(userId, 'normal')
        await client.sendMessage(remoteJid, { text: "🍒 Mode normal activé" }, { quoted: message })
        return
    }
    if (subCommand === 'mode') {
        const currentMode = getUserMode(userId)
        await client.sendMessage(remoteJid, { text: `🍒 Mode actuel : ${currentMode}` }, { quoted: message })
        return
    }

    // HELP
    if (!subCommand || subCommand === 'help') {
        const helpText = `🍒 CHATBOT

━━━━━━━━━━━━━━━━━━━━━━━━

📝 Commandes :
• .chat on - Activer le chatbot (groupe)
• .chat off - Désactiver le chatbot (groupe)
• .chat [message] - Discuter
• .chat clear - Effacer historique
• .chat mode - Voir mode actuel
• .chat on bro - Mode pote
• .chat on girlfriend - Mode copine
• .chat on boyfriend - Mode copain

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| BY WENS DEV`
        return sender(message, client, helpText)
    }

    // CLEAR
    if (subCommand === 'clear') {
        conversations.delete(userId)
        await client.sendMessage(remoteJid, { text: "🧹 Historique effacé" }, { quoted: message })
        return
    }

    // CHAT
    if (!prompt) {
        return sender(message, client, "❌ Utilisation : .chat [message]")
    }

    let history = conversations.get(userId) || []
    history.push({ role: 'user', content: prompt })

    const result = await getAIResponse(prompt, userId)
    if (!result.success) {
        return sender(message, client, "❌ Erreur, réessaie plus tard")
    }

    history.push({ role: 'assistant', content: result.response })
    if (history.length > 15) history = history.slice(-15)
    conversations.set(userId, history)

    let responseText = result.response
    if (responseText && responseText.length > 500) responseText = responseText.substring(0, 500) + "..."

    await client.sendMessage(remoteJid, { text: responseText }, { quoted: message })
}

// ==================== RÉPONSE AUTOMATIQUE ====================
export async function handleAutoReply(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const userId = message.key.participant || remoteJid
    const botNumber = client.user.id.split(':')[0]

    // Vérifier si c'est un groupe
    if (!remoteJid.endsWith('@g.us')) return

    // Vérifier si le chatbot est activé dans ce groupe
    if (!isChatbotEnabled(remoteJid)) return

    // Vérifier si le message est du bot
    if (message.key.fromMe) return

    // Vérifier si le bot est mentionné
    const mentioned = isBotMentioned(messageBody, botNumber)
    
    // Vérifier si c'est une salutation
    const greeting = isGreeting(messageBody)

    if (!mentioned && !greeting) return

    // Nettoyer le message
    let cleanMessage = messageBody
    if (mentioned) {
        cleanMessage = messageBody.replace(new RegExp(`@${botNumber}`, 'gi'), '').trim()
    }

    if (!cleanMessage && greeting) {
        cleanMessage = messageBody
    }

    // Mode aléatoire pour varier
    const modes = ['normal', 'bro', 'ami']
    const randomMode = modes[Math.floor(Math.random() * modes.length)]
    setUserMode(userId, randomMode)

    const result = await getAIResponse(cleanMessage, userId)
    if (!result.success) return

    let responseText = result.response
    if (responseText && responseText.length > 500) responseText = responseText.substring(0, 500) + "..."

    let finalResponse = responseText
    if (greeting && !mentioned) {
        const greetings = ['👋', '🌟', '✨', '💫', '⭐']
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
        finalResponse = `${randomGreeting} ${responseText}`
    }

    await client.sendMessage(remoteJid, { text: finalResponse }, { quoted: message })
}
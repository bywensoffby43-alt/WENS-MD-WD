import axios from 'axios'
import sender from './sender.js'

export default async function translate(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    
    // Format: .tr <langue> <texte> ou .translate <langue> <texte>
    const targetLang = args[0]?.toLowerCase()
    const text = args.slice(1).join(' ')

    if (!targetLang || !text) {
        const help = `╭─⌈ 🌐 TRADUCTION ⌋
│
│ *Utilisation:* .tr <langue> <texte>
│
│ *Langues disponibles:*
│ fr → français      en → anglais
│ es → espagnol      de → allemand
│ it → italien       pt → portugais
│ ar → arabe         zh → chinois
│ ru → russe         ja → japonais
│ ko → coréen        nl → néerlandais
│
│ *Exemples:*
│ .tr en Bonjour
│ .tr fr Hello world
│ .tr es How are you?
│
╰─⌊ WENS MD WD⌉`
        return sender(message, client, help)
    }

    await client.sendMessage(remoteJid, {
        react: { text: "🌐", key: message.key }
    })

    try {
        let translatedText = null
        let detectedLang = null

        // API 1: MyMemory (gratuite, fiable)
        try {
            const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`, {
                timeout: 8000
            })
            
            if (res.data?.responseData?.translatedText) {
                translatedText = res.data.responseData.translatedText
                detectedLang = res.data.responseData?.detectedLanguage || 'auto'
            }
        } catch (e) {
            console.log('MyMemory failed, trying fallback...')
        }

        // API 2: LibreTranslate (fallback)
        if (!translatedText) {
            try {
                const res = await axios.post('https://libretranslate.com/translate', {
                    q: text,
                    source: 'auto',
                    target: targetLang,
                    format: 'text'
                }, {
                    timeout: 8000,
                    headers: { 'Content-Type': 'application/json' }
                })
                
                if (res.data?.translatedText) {
                    translatedText = res.data.translatedText
                }
            } catch (e) {
                console.log('LibreTranslate failed')
            }
        }

        if (!translatedText) {
            return sender(message, client, '❌ Désolé, la traduction est indisponible pour le moment. Réessaie plus tard.')
        }

        // Noms des langues
        const langNames = {
            fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand',
            it: 'Italien', pt: 'Portugais', ar: 'Arabe', zh: 'Chinois',
            ru: 'Russe', ja: 'Japonais', ko: 'Coréen', nl: 'Néerlandais'
        }
        
        const targetName = langNames[targetLang] || targetLang.toUpperCase()
        const sourceName = detectedLang ? (langNames[detectedLang] || detectedLang.toUpperCase()) : 'Auto'

        const result = `╭─⌈ 🌐 TRADUCTION ⌋
│
│ 📝 *Texte original:* ${text}
│ 🌍 *Langue:* ${sourceName}
│
│ ✨ *Traduction (${targetName}):*
│ ${translatedText}
│
╰─⌊ WENS MD WD⌉`

        await client.sendMessage(remoteJid, {
            text: result
        }, { quoted: message })

        await client.sendMessage(remoteJid, {
            react: { text: "✅", key: message.key }
        })

    } catch (error) {
        console.error('Translate error:', error)
        sender(message, client, '❌ Erreur lors de la traduction')
    }
}
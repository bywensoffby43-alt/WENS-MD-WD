// commands/lyrics.js
import axios from 'axios'
import sender from './sender.js'

export default async function lyricsCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const songTitle = args.join(' ').trim()

    if (!songTitle) {
        const help = `🎵 LYRICS

━━━━━━━━━━━━━━━━━━━━━━━━

📌 Utilisation : .lyrics <titre de chanson>

💡 Exemple :
.lyrics imagine dragons believer

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
        return sender(message, client, help)
    }

    await client.sendMessage(remoteJid, {
        react: { text: "🎵", key: message.key }
    })

    try {
        // API 1 : Lyrics.ovh (gratuite et fiable)
        try {
            const artist = songTitle.split(' ')[0]
            const title = songTitle.split(' ').slice(1).join(' ')
            
            if (artist && title) {
                const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
                    timeout: 8000
                })
                
                if (response.data?.lyrics) {
                    let lyricsText = response.data.lyrics
                    
                    // Nettoyer et limiter
                    lyricsText = lyricsText.replace(/\[.*?\]/g, '').trim()
                    if (lyricsText.length > 3900) {
                        lyricsText = lyricsText.substring(0, 3900) + '\n\n... (suite trop longue)'
                    }
                    
                    const result = `🎤 PAROLES DE "${songTitle.toUpperCase()}"

━━━━━━━━━━━━━━━━━━━━━━━━

${lyricsText}

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
                    
                    await client.sendMessage(remoteJid, { text: result }, { quoted: message })
                    await client.sendMessage(remoteJid, { react: { text: "✅", key: message.key } })
                    return
                }
            }
        } catch (e) {
            console.log('Lyrics.ovh failed, trying backup...')
        }

        // API 2 : Some Random API
        try {
            const response = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(songTitle)}`, {
                timeout: 8000
            })
            
            if (response.data?.lyrics) {
                let lyricsText = response.data.lyrics
                const title = response.data.title || songTitle
                const author = response.data.author || 'Artiste inconnu'
                
                if (lyricsText.length > 3900) {
                    lyricsText = lyricsText.substring(0, 3900) + '\n\n... (suite trop longue)'
                }
                
                const result = `🎤 PAROLES DE "${title.toUpperCase()}"

━━━━━━━━━━━━━━━━━━━━━━━━

👤 Artiste : ${author}

${lyricsText}

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
                
                await client.sendMessage(remoteJid, { text: result }, { quoted: message })
                await client.sendMessage(remoteJid, { react: { text: "✅", key: message.key } })
                return
            }
        } catch (e) {
            console.log('Some-random-api failed, trying fallback...')
        }

        // API 3 : Fallback - recherche Google
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(songTitle)}+lyrics`
        
        const fallback = `🎤 PAROLES NON TROUVÉES

━━━━━━━━━━━━━━━━━━━━━━━━

Désolé, je n'ai pas trouvé les paroles de "${songTitle}".

🔗 Recherche manuelle :
${searchUrl}

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
        
        await client.sendMessage(remoteJid, { text: fallback }, { quoted: message })
        await client.sendMessage(remoteJid, { react: { text: "❌", key: message.key } })

    } catch (error) {
        console.error('Lyrics error:', error)
        
        await client.sendMessage(remoteJid, {
            text: `❌ Erreur lors de la recherche des paroles.\n\n🔗 https://www.google.com/search?q=${encodeURIComponent(songTitle)}+lyrics\n\n🔥 GOLDEN-MD-V2 | The GoldenBoy`
        }, { quoted: message })
    }
}
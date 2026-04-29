// commands/waifu.js
import axios from 'axios'
import sender from './sender.js'

const validTypes = ['waifu', 'neko', 'shinobu', 'megumin', 'cuddle', 'hug']

export default async function waifuCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const type = args[0]?.toLowerCase() || 'waifu'

    try {
        // Afficher la liste des types disponibles
        if (type === 'list') {
            const listMessage = `╭─────────────────────────────────────────────╮
│              🎨 WAIFU COMMAND 🎨            │
├─────────────────────────────────────────────┤
│                                             │
│  📌 Types disponibles :                     │
│                                             │
│  • .waifu waifu    → Image waifu           │
│  • .waifu neko     → Image neko (chat)     │
│  • .waifu shinobu  → Image Shinobu         │
│  • .waifu megumin  → Image Megumin         │
│  • .waifu cuddle   → Image câlin           │
│  • .waifu hug      → Image calin           │
│  • .waifu list     → Affiche cette liste   │
│                                             │
│  💡 Exemples :                              │
│  .waifu neko                               │
│  .waifu hug                                │
│                                             │
├─────────────────────────────────────────────┤
│  🔥 WENS MD WD| WENS DEV            │
╰─────────────────────────────────────────────╯`
            return client.sendMessage(remoteJid, { text: listMessage }, { quoted: message })
        }

        // Vérifier si le type est valide
        const apiType = validTypes.includes(type) ? type : 'waifu'

        // Message d'attente
        await client.sendMessage(remoteJid, {
            text: `⏳ Recherche d'une image ${apiType}...`
        }, { quoted: message })

        // Appel API
        const response = await axios.get(`https://api.waifu.pics/sfw/${apiType}`, { timeout: 10000 })
        const imageUrl = response.data?.url

        if (!imageUrl) {
            throw new Error('Aucune image trouvée')
        }

        // Envoi de l'image
        await client.sendMessage(remoteJid, {
            image: { url: imageUrl },
            caption: `╭─────────────────────────────────────────────╮
│              🎨 ${apiType.toUpperCase()} 🎨              │
├─────────────────────────────────────────────┤
│                                             │
│  ✨ Voici ton image ${apiType} !            │
│                                             │
├─────────────────────────────────────────────┤
│  🔥 WENS MD WD| WENS DEV            │
╰─────────────────────────────────────────────╯`
        }, { quoted: message })

    } catch (error) {
        console.error('Waifu error:', error)
        
        const errorMessage = `╭─────────────────────────────────────────────╮
│              🎨 WAIFU COMMAND 🎨            │
├─────────────────────────────────────────────┤
│                                             │
│  ❌ Erreur !                                │
│                                             │
│  Impossible de récupérer une image.        │
│  Réessaie plus tard.                       │
│                                             │
├─────────────────────────────────────────────┤
│  🔥 WENS MD WD| WENS DEV            │
╰─────────────────────────────────────────────╯`
        
        client.sendMessage(remoteJid, { text: errorMessage }, { quoted: message })
    }
}
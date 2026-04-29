// commands/aide.js
import sender from './sender.js'

// Base de données des commandes avec descriptions
const commandesInfo = {
    // ========== UTILS ==========
    uptime: {
        nom: "uptime",
        description: "Affiche le temps d'activité du bot",
        utilisation: ".uptime",
        exemple: ".uptime",
        categorie: "📊 Utilitaires",
        aliases: []
    },
    ping: {
        nom: "ping",
        description: "Vérifie la latence du bot",
        utilisation: ".ping",
        exemple: ".ping",
        categorie: "📊 Utilitaires",
        aliases: []
    },
    menu: {
        nom: "menu",
        description: "Affiche le menu principal du bot",
        utilisation: ".menu",
        exemple: ".menu",
        categorie: "📊 Utilitaires",
        aliases: []
    },
    fancy: {
        nom: "fancy",
        description: "Transforme ton texte en style fancy",
        utilisation: ".fancy <texte>",
        exemple: ".fancy Bonjour le monde",
        categorie: "🎨 Styles",
        aliases: []
    },
    
    // ========== IA ==========
    ai: {
        nom: "ai",
        description: "Pose une question à l'intelligence artificielle",
        utilisation: ".ai <question>",
        exemple: ".ai Quelle est la capitale de la France ?",
        categorie: "🤖 Intelligence Artificielle",
        aliases: []
    },
    golden: {
        nom: "golden",
        description: "Pose une question à golden IA", 
        utilisation: ".golden <question>",
        exemple: ".golden Qui est Dieu ?",
        categorie: "🤖 Intelligence Artificielle",
        aliases: []
    }, 
    gpt: {
        nom: "gpt",
        description: "Pose une question à GPT (IA avancée)",
        utilisation: ".gpt <question>",
        exemple: ".gpt Explique-moi la relativité",
        categorie: "🤖 Intelligence Artificielle",
        aliases: []
    },
    darkgpt: {
        nom: "darkgpt",
        description: "IA sans censure - Répond à TOUT",
        utilisation: ".darkgpt <question> ou .darkgpt clear",
        exemple: ".darkgpt Qui est le meilleur ?",
        categorie: "🤖 Intelligence Artificielle",
        aliases: []
    },
    
    // ========== MÉDIAS ==========
    sticker: {
        nom: "sticker",
        description: "Convertit une image ou vidéo en sticker",
        utilisation: "Répondre à une image/vidéo avec .sticker",
        exemple: ".sticker (en répondant à une image)",
        categorie: "🎬 Médias",
        aliases: []
    },
    play: {
        nom: "play",
        description: "Télécharge et envoie une musique depuis YouTube",
        utilisation: ".play <titre de chanson>",
        exemple: ".play imagine dragons believer",
        categorie: "🎬 Médias",
        aliases: []
    },
    tiktok: {
        nom: "tiktok",
        description: "Télécharge une vidéo TikTok sans watermark",
        utilisation: ".tiktok <lien TikTok>",
        exemple: ".tiktok https://vm.tiktok.com/xxx",
        categorie: "🎬 Médias",
        aliases: []
    },
    img: {
        nom: "img",
        description: "Recherche des images sur Pinterest",
        utilisation: ".img <mot-clé>",
        exemple: ".img hacker setup",
        categorie: "🎬 Médias",
        aliases: []
    },
    lyrics: {
        nom: "lyrics",
        description: "Trouve les paroles d'une chanson",
        utilisation: ".lyrics <titre chanson>",
        exemple: ".lyrics believer imagine dragons",
        categorie: "🎬 Médias",
        aliases: []
    },
    apk: {
        nom: "apk",
        description: "Télécharge des applications Android (APK)",
        utilisation: ".apk <nom app>",
        exemple: ".apk termux",
        categorie: "🎬 Médias",
        aliases: []
    },
    anime: {
        nom: "anime",
        description: "Envoie des stickers d'anime (kiss, hug, etc.)",
        utilisation: ".anime <type>",
        exemple: ".anime kiss",
        categorie: "🎬 Médias",
        aliases: []
    },
    
    // ========== GROUPES ==========
    kick: {
        nom: "kick",
        description: "Expulse un membre du groupe",
        utilisation: ".kick @user",
        exemple: ".kick @utilisateur",
        categorie: "👥 Groupes",
        aliases: []
    },
    promote: {
        nom: "promote",
        description: "Nomme un membre admin du groupe",
        utilisation: ".promote @user",
        exemple: ".promote @utilisateur",
        categorie: "👥 Groupes",
        aliases: []
    },
    demote: {
        nom: "demote",
        description: "Retire le rôle admin d'un membre",
        utilisation: ".demote @user",
        exemple: ".demote @utilisateur",
        categorie: "👥 Groupes",
        aliases: []
    },
    tagall: {
        nom: "tagall",
        description: "Mentionne tous les membres du groupe",
        utilisation: ".tagall",
        exemple: ".tagall",
        categorie: "👥 Groupes",
        aliases: []
    },
    tagadmin: {
        nom: "tagadmin",
        description: "Mentionne tous les admins du groupe",
        utilisation: ".tagadmin",
        exemple: ".tagadmin",
        categorie: "👥 Groupes",
        aliases: []
    },
    groupstatut: {
        nom: "groupstatut",
        description: "Affiche ou modifie le statut du groupe",
        utilisation: ".groupstatut ou .groupstatut name <nom>",
        exemple: ".groupstatut name MON GROUPE",
        categorie: "👥 Groupes",
        aliases: []
    },
    antilink: {
        nom: "antilink",
        description: "Active/désactive la protection anti-liens",
        utilisation: ".antilink on/off",
        exemple: ".antilink on",
        categorie: "👥 Groupes",
        aliases: []
    },
    mute: {
        nom: "mute",
        description: "Ferme le groupe (seuls les admins peuvent parler)",
        utilisation: ".mute",
        exemple: ".mute",
        categorie: "👥 Groupes",
        aliases: []
    },
    unmute: {
        nom: "unmute",
        description: "Ouvre le groupe (tout le monde peut parler)",
        utilisation: ".unmute",
        exemple: ".unmute",
        categorie: "👥 Groupes",
        aliases: []
    },
    actif: {
        nom: "actif",
        description: "Affiche les membres les plus actifs",
        utilisation: ".actif",
        exemple: ".actif",
        categorie: "👥 Groupes",
        aliases: ["top"]
    },
    inactif: {
        nom: "inactif",
        description: "Affiche les membres qui n'ont jamais écrit",
        utilisation: ".inactif",
        exemple: ".inactif",
        categorie: "👥 Groupes",
        aliases: []
    },
    rank: {
        nom: "rank",
        description: "Affiche ton niveau ou celui d'un membre",
        utilisation: ".rank ou .rank @user",
        exemple: ".rank",
        categorie: "👥 Groupes",
        aliases: ["niveau"]
    },
    
    // ========== MODÉRATION ==========
    ban: {
        nom: "ban",
        description: "Bannit un utilisateur (ne peut plus utiliser le bot)",
        utilisation: ".ban @user",
        exemple: ".ban @utilisateur",
        categorie: "🛡️ Modération",
        aliases: []
    },
    unban: {
        nom: "unban",
        description: "Débannit un utilisateur",
        utilisation: ".unban @user",
        exemple: ".unban @utilisateur",
        categorie: "🛡️ Modération",
        aliases: []
    },
    checkban: {
        nom: "checkban",
        description: "Vérifie si un utilisateur est banni",
        utilisation: ".checkban @user",
        exemple: ".checkban @utilisateur",
        categorie: "🛡️ Modération",
        aliases: []
    },
    warn: {
        nom: "warn",
        description: "Avertit un membre (3 warns = kick)",
        utilisation: ".warn @user",
        exemple: ".warn @utilisateur",
        categorie: "🛡️ Modération",
        aliases: []
    },
    
    // ========== FUN ==========
    insult: {
        nom: "insult",
        description: "Insulte quelqu'un de façon drôle",
        utilisation: ".insult @user",
        exemple: ".insult @utilisateur",
        categorie: "🎮 Fun",
        aliases: []
    },
    fact: {
        nom: "fact",
        description: "Affiche un fait insolite",
        utilisation: ".fact ou .fact <catégorie>",
        exemple: ".fact animaux",
        categorie: "🎮 Fun",
        aliases: []
    },
    quote: {
        nom: "quote",
        description: "Affiche une citation inspirante",
        utilisation: ".quote",
        exemple: ".quote",
        categorie: "🎮 Fun",
        aliases: []
    },
    weather: {
        nom: "weather",
        description: "Affiche la météo d'une ville",
        utilisation: ".weather <ville>",
        exemple: ".weather Paris",
        categorie: "🎮 Fun",
        aliases: []
    },
    translate: {
        nom: "translate",
        description: "Traduit un texte dans une autre langue",
        utilisation: ".tr <langue> <texte>",
        exemple: ".tr en Bonjour",
        categorie: "🎮 Fun",
        aliases: ["tr"]
    },
    
    // ========== OWNER ==========
    sudo: {
        nom: "sudo",
        description: "Ajoute un utilisateur sudo (accès admin)",
        utilisation: ".sudo @user",
        exemple: ".sudo @utilisateur",
        categorie: "👑 Owner",
        aliases: []
    },
    delsudo: {
        nom: "delsudo",
        description: "Retire un utilisateur sudo",
        utilisation: ".delsudo @user",
        exemple: ".delsudo @utilisateur",
        categorie: "👑 Owner",
        aliases: []
    },
    setprefix: {
        nom: "setprefix",
        description: "Change le préfixe du bot",
        utilisation: ".setprefix <nouveau préfixe>",
        exemple: ".setprefix !",
        categorie: "👑 Owner",
        aliases: []
    },
    public: {
        nom: "public",
        description: "Active/désactive le mode public",
        utilisation: ".public on/off",
        exemple: ".public on",
        categorie: "👑 Owner",
        aliases: []
    }
}

export default async function aideCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const commande = args[0]?.toLowerCase()

    try {
        // ========== AFFICHER L'AIDE GÉNÉRALE ==========
        if (!commande) {
            // Grouper les commandes par catégorie
            const categories = {}
            for (const [cmd, info] of Object.entries(commandesInfo)) {
                if (!categories[info.categorie]) categories[info.categorie] = []
                categories[info.categorie].push(cmd)
            }

            let helpText = `╔══════════════════════════════════════════════════════════════════╗
║                      📚 𝐀𝐈𝐃𝐄 𝐃𝐔 𝐁𝐎𝐓 📚                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  🔍 *Utilisation :* .aide <commande>                            ║
║                                                                  ║
║  📖 *Exemple :* .aide sticker                                   ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║`

            for (const [categorie, commandes] of Object.entries(categories)) {
                helpText += `\n║  📂 *${categorie}*\n║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n║  `
                helpText += commandes.map(cmd => `.${cmd}`).join(', ')
                helpText += `\n║                                                                  ║`
            }

            helpText += `\n╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD|  WENS DEV  🤫                              ║
╚══════════════════════════════════════════════════════════════════╝`

            await client.sendMessage(remoteJid, { text: helpText }, { quoted: message })
            return
        }

        // ========== AFFICHER L'AIDE D'UNE COMMANDE SPÉCIFIQUE ==========
        const commandeInfo = commandesInfo[commande]
        
        if (!commandeInfo) {
            return sender(message, client, `❌ Commande "${commande}" non trouvée.\n\n📌 Utilise .aide pour voir la liste des commandes.`)
        }

        // Aliases
        const aliasesText = commandeInfo.aliases && commandeInfo.aliases.length > 0 
            ? `\n║  🔄 *Alias :* ${commandeInfo.aliases.map(a => `.${a}`).join(', ')}` 
            : ''

        const helpDetail = `╔══════════════════════════════════════════════════════════════════╗
║                    📖 ${commandeInfo.nom.toUpperCase()} 📖                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  📂 *Catégorie :* ${commandeInfo.categorie}
║                                                                  ║
║  📝 *Description :* 
║  ${commandeInfo.description}
║                                                                  ║
║  ⚙️ *Utilisation :* 
║  ${commandeInfo.utilisation}
║                                                                  ║
║  💡 *Exemple :* 
║  ${commandeInfo.exemple}${aliasesText}
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD |  WENS DEV  🤫                              ║
╚══════════════════════════════════════════════════════════════════╝`

        await client.sendMessage(remoteJid, { text: helpDetail }, { quoted: message })

    } catch (error) {
        console.error('Aide error:', error)
        sender(message, client, '❌ Erreur lors de l\'affichage de l\'aide')
    }
}
import axios from 'axios'
import sender from './sender.js'

// Base de données de faits en FRANÇAIS (100+)
const frenchFacts = [
    { text: "Les poulpes ont trois cœurs.", category: "🦑 Animaux" },
    { text: "Les koalas ont des empreintes digitales similaires à celles des humains.", category: "🐨 Animaux" },
    { text: "Un groupe de flamants roses s'appelle une 'flamboyance'.", category: "🦩 Animaux" },
    { text: "Les dauphins ont des noms les uns pour les autres.", category: "🐬 Animaux" },
    { text: "Les éléphants sont les seuls mammifères qui ne peuvent pas sauter.", category: "🐘 Animaux" },
    { text: "Une pieuvre a trois cœurs et neuf cerveaux.", category: "🐙 Animaux" },
    { text: "Les chats passent 70% de leur vie à dormir.", category: "🐱 Animaux" },
    { text: "Un escargot peut dormir pendant trois ans.", category: "🐌 Animaux" },
    { text: "Les yeux des autruches sont plus gros que leur cerveau.", category: "🐦 Animaux" },
    { text: "Les kangourous ne peuvent pas reculer.", category: "🦘 Animaux" },
    { text: "Le cœur d'une crevette est situé dans sa tête.", category: "🦐 Animaux" },
    { text: "Les ours polaires ont la peau noire.", category: "🐻‍❄️ Animaux" },
    { text: "Les girafes ont 7 vertèbres cervicales comme les humains.", category: "🦒 Animaux" },
    { text: "Un hippopotame peut courir plus vite qu'un humain.", category: "🦛 Animaux" },
    { text: "Les renards utilisent le champ magnétique terrestre pour chasser.", category: "🦊 Animaux" },
    { text: "Les fourmis ne dorment jamais.", category: "🐜 Animaux" },
    { text: "Les abeilles peuvent reconnaître les visages humains.", category: "🐝 Animaux" },
    
    { text: "L'eau bouillante se transforme en glace plus rapidement que l'eau froide (effet Mpemba).", category: "🔬 Science" },
    { text: "Un nuage peut peser plus d'un million de tonnes.", category: "☁️ Science" },
    { text: "Le sable des déserts peut chanter lorsqu'il est déplacé.", category: "🏜️ Science" },
    { text: "Il y a plus d'arbres sur Terre que d'étoiles dans la Voie lactée.", category: "🌳 Science" },
    { text: "La lumière du soleil met 8 minutes pour atteindre la Terre.", category: "☀️ Science" },
    { text: "Une année sur Vénus dure moins longtemps qu'une journée sur Vénus.", category: "🪐 Science" },
    { text: "L'oxygène représente environ 21% de l'atmosphère terrestre.", category: "🔬 Science" },
    
    { text: "L'humain moyen passe 6 mois de sa vie à attendre que les feux passent au vert.", category: "👤 Humain" },
    { text: "Votre estomac produit une nouvelle couche de mucus toutes les deux semaines.", category: "👤 Humain" },
    { text: "Les bébés naissent avec 300 os, les adultes n'en ont que 206.", category: "👤 Humain" },
    { text: "Le cœur humain bat environ 100 000 fois par jour.", category: "❤️ Humain" },
    { text: "Vous perdez environ 80 cheveux par jour.", category: "💇 Humain" },
    { text: "Un humain cligne des yeux environ 15 000 fois par jour.", category: "👁️ Humain" },
    { text: "Les os sont plus solides que l'acier.", category: "🦴 Humain" },
    
    { text: "La tour Eiffel peut grandir de 15 cm en été à cause de la chaleur.", category: "🏛️ Histoire" },
    { text: "Cléopâtre vivait plus près de l'invention de l'iPhone que de la construction des pyramides.", category: "🏛️ Histoire" },
    { text: "Le premier message texte a été envoyé en 1992. Il disait 'Merry Christmas'.", category: "📱 Histoire" },
    { text: "Les anciens Égyptiens utilisaient des crottes de crocodile comme contraceptif.", category: "🏛️ Histoire" },
    { text: "La Grande Muraille de Chine n'est pas visible depuis l'espace.", category: "🏛️ Histoire" },
    
    { text: "Le chocolat était autrefois utilisé comme monnaie par les Aztèques.", category: "🍫 Nourriture" },
    { text: "Les bananes sont techniquement des baies, alors que les fraises ne le sont pas.", category: "🍌 Nourriture" },
    { text: "Le miel ne se périme jamais.", category: "🍯 Nourriture" },
    { text: "Les carottes n'étaient pas orange à l'origine, elles étaient violettes.", category: "🥕 Nourriture" },
    { text: "L'eau chaude gèle plus vite que l'eau froide.", category: "💧 Nourriture" },
    
    { text: "Le temps le plus long entre deux naissances de jumeaux est de 87 jours.", category: "🤯 Insolite" },
    { text: "Il y a un hôtel en Bolivie entièrement fait de sel.", category: "🤯 Insolite" },
    { text: "Les moustiques sont attirés par la couleur bleue.", category: "🦟 Insolite" },
    { text: "Il est impossible de lécher son propre coude.", category: "🤯 Insolite" },
    { text: "Les empreintes digitales des koalas sont presque identiques à celles des humains.", category: "🤯 Insolite" },
    { text: "Un jour sur Vénus dure plus longtemps qu'une année sur Vénus.", category: "🪐 Insolite" },
    
    { text: "Le cerveau humain génère autant d'électricité qu'une ampoule de 10 watts.", category: "🧠 Cerveau" },
    { text: "Le cerveau humain est composé à 75% d'eau.", category: "🧠 Cerveau" },
    { text: "Le cerveau ne ressent pas la douleur.", category: "🧠 Cerveau" },
    
    { text: "Les cactus peuvent stocker jusqu'à 5000 litres d'eau.", category: "🌵 Plantes" },
    { text: "Le bambou peut pousser de 90 cm en une journée.", category: "🎋 Plantes" },
    { text: "Les tournesols suivent le soleil pendant la journée.", category: "🌻 Plantes" }
]

export default async function fact(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const category = args[0]?.toLowerCase()

    await client.sendMessage(remoteJid, {
        react: { text: "🤯", key: message.key }
    })

    try {
        let factText = null
        let factCategory = null
        
        // Filtrer par catégorie si demandé
        let filteredFacts = frenchFacts
        
        if (category) {
            const categoryMap = {
                'animaux': '🦑 Animaux',
                'animal': '🦑 Animaux',
                'science': '🔬 Science',
                'humain': '👤 Humain',
                'corps': '👤 Humain',
                'histoire': '🏛️ Histoire',
                'nourriture': '🍫 Nourriture',
                'bouffe': '🍫 Nourriture',
                'insolite': '🤯 Insolite',
                'bizarre': '🤯 Insolite',
                'cerveau': '🧠 Cerveau',
                'plantes': '🌵 Plantes'
            }
            
            const targetCategory = categoryMap[category]
            if (targetCategory) {
                filteredFacts = frenchFacts.filter(f => f.category === targetCategory)
            }
            
            if (filteredFacts.length === 0) {
                filteredFacts = frenchFacts
            }
        }
        
        // Choisir un fait aléatoire
        const randomFact = filteredFacts[Math.floor(Math.random() * filteredFacts.length)]
        factText = randomFact.text
        factCategory = randomFact.category

        const result = `╭─⌈ 🤯 FAIT INSOLITE ⌋
│
│ 📂 *Catégorie:* ${factCategory}
│
│ 📝 *Savais-tu que...*
│
│ ${factText}
│
│ 📡 *Source:* 📚 Base française
│
╰─⌊ WENS-MD-WD ⌉`

        await client.sendMessage(remoteJid, {
            text: result
        }, { quoted: message })

        await client.sendMessage(remoteJid, {
            react: { text: "✅", key: message.key }
        })

    } catch (error) {
        console.error('Fact error:', error)
        
        // Dernier recours
        const fallbackFact = frenchFacts[Math.floor(Math.random() * frenchFacts.length)]
        await client.sendMessage(remoteJid, {
            text: `🤯 *Fait insolite*\n\n${fallbackFact.text}`
        }, { quoted: message })
    }
}
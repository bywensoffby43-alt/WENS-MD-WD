// commands/hack.js
import sender from './sender.js'

export default async function hackCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    
    // Récupérer la cible (mention ou argument)
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    const target = mentioned?.[0] || null
    const targetNum = target
        ? target.split('@')[0]
        : args.join('').replace(/[^0-9]/g, '') || '50956045994'
    const targetName = target ? `@${targetNum}` : (args.join(' ') || 'Cible')

    // Base de données indicatifs → pays/ville/opérateur
    const prefixData = {
        '509': { pays: 'Haïti', ville: 'Port-au-Prince', isp: 'Digicel Haïti', lat: '18.5944', lon: '-72.3074', tz: 'America/Port-au-Prince' },
        '221': { pays: 'Sénégal', ville: 'Dakar', isp: 'Orange Sénégal', lat: '14.6928', lon: '-17.4467', tz: 'Africa/Dakar' },
        '225': { pays: "Côte d'Ivoire", ville: 'Abidjan', isp: 'MTN Côte d\'Ivoire', lat: '5.3600', lon: '-4.0083', tz: 'Africa/Abidjan' },
        '237': { pays: 'Cameroun', ville: 'Yaoundé', isp: 'MTN Cameroun', lat: '3.8480', lon: '11.5021', tz: 'Africa/Douala' },
        '224': { pays: 'Guinée', ville: 'Conakry', isp: 'Orange Guinée', lat: '9.6412', lon: '-13.5784', tz: 'Africa/Conakry' },
        '229': { pays: 'Bénin', ville: 'Cotonou', isp: 'MTN Bénin', lat: '6.3654', lon: '2.4183', tz: 'Africa/Porto-Novo' },
        '243': { pays: 'RD Congo', ville: 'Kinshasa', isp: 'Airtel Congo', lat: '-4.3317', lon: '15.3272', tz: 'Africa/Kinshasa' },
        '242': { pays: 'Congo', ville: 'Brazzaville', isp: 'MTN Congo', lat: '-4.2661', lon: '15.2832', tz: 'Africa/Brazzaville' },
        '241': { pays: 'Gabon', ville: 'Libreville', isp: 'Airtel Gabon', lat: '0.3901', lon: '9.4544', tz: 'Africa/Libreville' },
        '223': { pays: 'Mali', ville: 'Bamako', isp: 'Orange Mali', lat: '12.6392', lon: '-8.0029', tz: 'Africa/Bamako' },
        '226': { pays: 'Burkina Faso', ville: 'Ouagadougou', isp: 'Orange Burkina', lat: '12.3681', lon: '-1.5275', tz: 'Africa/Ouagadougou' },
        '227': { pays: 'Niger', ville: 'Niamey', isp: 'Airtel Niger', lat: '13.5116', lon: '2.1254', tz: 'Africa/Niamey' },
        '212': { pays: 'Maroc', ville: 'Casablanca', isp: 'Maroc Telecom', lat: '33.5731', lon: '-7.5898', tz: 'Africa/Casablanca' },
        '213': { pays: 'Algérie', ville: 'Alger', isp: 'Djezzy', lat: '36.7538', lon: '3.0588', tz: 'Africa/Algiers' },
        '216': { pays: 'Tunisie', ville: 'Tunis', isp: 'Ooredoo Tunisie', lat: '36.8190', lon: '10.1658', tz: 'Africa/Tunis' },
        '228': { pays: 'Togo', ville: 'Lomé', isp: 'Togocel', lat: '6.1375', lon: '1.2123', tz: 'Africa/Lome' },
        '222': { pays: 'Mauritanie', ville: 'Nouakchott', isp: 'Mauritel', lat: '18.0735', lon: '-15.9582', tz: 'Africa/Nouakchott' },
        '235': { pays: 'Tchad', ville: "N'Djamena", isp: 'Airtel Tchad', lat: '12.1048', lon: '15.0445', tz: 'Africa/Ndjamena' },
        '236': { pays: 'Centrafrique', ville: 'Bangui', isp: 'Orange RCA', lat: '4.3612', lon: '18.5550', tz: 'Africa/Bangui' },
        '33': { pays: 'France', ville: 'Paris', isp: 'Orange France', lat: '48.8566', lon: '2.3522', tz: 'Europe/Paris' },
        '1': { pays: 'États-Unis', ville: 'New York', isp: 'AT&T', lat: '40.7128', lon: '-74.0060', tz: 'America/New_York' },
        '44': { pays: 'Royaume-Uni', ville: 'Londres', isp: 'BT Group', lat: '51.5074', lon: '-0.1278', tz: 'Europe/London' }
    }

    try {
        // Détecter le préfixe
        let info = null
        for (const len of [3, 2, 1]) {
            const prefix = targetNum.substring(0, len)
            if (prefixData[prefix]) {
                info = prefixData[prefix]
                break
            }
        }

        if (!info) {
            info = { pays: 'Inconnu', ville: 'Inconnue', isp: 'Opérateur inconnu', lat: '0.0000', lon: '0.0000', tz: 'UTC' }
        }

        // Générer données fake
        const ipFake = `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        const macAddr = Array.from({ length: 6 }, () =>
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join(':').toUpperCase()
        const dataGB = (Math.random() * 3 + 0.5).toFixed(1)
        const contacts = Math.floor(Math.random() * 400 + 50)
        const photos = Math.floor(Math.random() * 2000 + 100)
        const msgs = Math.floor(Math.random() * 8000 + 500)

        // Message d'attente
        await client.sendMessage(remoteJid, {
            react: { text: "💀", key: message.key }
        })

        const steps = [
            `╔══════════════════════════════════════════════════════════════════╗
║                   💀 WENS 𝐇𝐀𝐂𝐊 𝐓𝐎𝐎𝐋 💀                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  🎯 *Cible :* ${targetName}
║  📱 *Numéro :* +${targetNum}
║                                                                  ║
║  ⏳ Initialisation du scan...                                    ║
║  🔄 Connexion au serveur proxy sécurisé...                       ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD|  WENS DEV 🔥                              ║
╚══════════════════════════════════════════════════════════════════╝`,

            `╔══════════════════════════════════════════════════════════════════╗
║                   💀 𝐒𝐂𝐀𝐍 𝐑𝐄́𝐒𝐄𝐀𝐔 💀                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  📡 *Analyse des ports :* ██████░░░░ 60%                        ║
║  🌐 *IP publique :* \`${ipFake}\`                                    ║
║  🔓 *Ports ouverts :* 22, 80, 443, 8080                         ║
║  ⚠️ *Firewall détecté...*                                       ║
║  ✅ *Contournement réussi !*                                    ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD|  WENS DEV 🔥                              ║
╚══════════════════════════════════════════════════════════════════╝`,

            `╔══════════════════════════════════════════════════════════════════╗
║                   💀 𝐋𝐎𝐂𝐀𝐋𝐈𝐒𝐀𝐓𝐈𝐎𝐍 💀                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  🌍 *Pays :* ${info.pays}
║  🏙️ *Ville :* ${info.ville}
║  🛰️ *Coordonnées :* ${info.lat}, ${info.lon}
║  ⏰ *Timezone :* ${info.tz}
║  📡 *Opérateur :* ${info.isp}
║  🖧 *Adresse MAC :* \`${macAddr}\`
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD|  WENS DEV 🔥                              ║
╚══════════════════════════════════════════════════════════════════╝`,

            `╔══════════════════════════════════════════════════════════════════╗
║                   💀 𝐄𝐗𝐓𝐑𝐀𝐂𝐓𝐈𝐎𝐍 💀                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  📁 *Contacts :* ${contacts} extraits
║  📸 *Photos :* ${photos} récupérées
║  💬 *Messages :* ${msgs} lus
║  🔑 *Mots de passe :* ${Math.floor(Math.random() * 20 + 5)} trouvés
║  💾 *Données :* ${dataGB} GB
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD|  WENS DEV 🔥                              ║
╚══════════════════════════════════════════════════════════════════╝`,

            `╔══════════════════════════════════════════════════════════════════╗
║                   💀 𝐇𝐀𝐂𝐊 𝐓𝐄𝐑𝐌𝐈𝐍𝐄́ 💀                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ✅ *Cible :* ${targetName}
║  📍 *Localisation :* ${info.ville}, ${info.pays}
║  🌐 *IP :* \`${ipFake}\`
║  📊 *Données extraites :* ${dataGB} GB
║                                                                  ║
║  ⚠️ *SIMULATION UNIQUEMENT*                                     ║
║  *Aucune vraie donnée collectée*                                ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  🔥 WENS MD WD|  BY WENS DEV 🔥                              ║
╚══════════════════════════════════════════════════════════════════╝`
        ]

        for (let i = 0; i < steps.length; i++) {
            await client.sendMessage(remoteJid, { text: steps[i] }, { quoted: message })
            if (i < steps.length - 1) await new Promise(r => setTimeout(r, 2500))
        }

        await client.sendMessage(remoteJid, {
            react: { text: "✅", key: message.key }
        })

    } catch (error) {
        console.error('Hack error:', error)
        sender(message, client, '❌ Erreur lors de la simulation')
    }
}
import axios from 'axios';
export async function execute(client, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(" ");

    if(!query){
        await client.sendMessage(from, {
            image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
            caption: `❌ Veuillez poser une question.\nUsage : !ai-kyro <question>\n\nBY WENS HACKING`
        }, { quoted: msg });
        return;
    }

    await client.sendMessage(from, {
        image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
        caption: `🤖 L'IA Kyro réfléchit à votre question... Patientez.\n\nBY DEV HACKER`
    }, { quoted: msg });

    try {
        // Appel API GPT-4o de GiftedTech (exemple gratuit)
        const response = await axios.get(`https://api.giftedtech.co.ke/api/ai/gpt4o?apikey=gifted&q=${encodeURIComponent(query)}`);

        if(response.data && response.data.success && response.data.result){
            const answer = response.data.result;

            await client.sendMessage(from, {
                image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
                caption: `💬 Question : ${query}\n\n🤖 Réponse : ${answer}\n\nBY WENS HACKING`
            }, { quoted: msg });

        } else {
            throw new Error("Réponse invalide de l'API");
        }

    } catch(err){
        console.error("Erreur API ai-kyro :", err);
        await client.sendMessage(from, {
            image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
            caption: `❌ Une erreur est survenue avec l'IA. Réessaie plus tard.\n\nBY WENS HACKING`
        }, { quoted: msg });
    }
}
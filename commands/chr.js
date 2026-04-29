export default async function bb(client, message) {

    const replies = [

        "",

        "> *YE BRO SAK PASE 😒*",

        "> *YOW OU BIEN 😅*",

        "> *BYE BRO 👨‍🦯*"

    ];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    await client.sendMessage(message.key.remoteJid, {

        text: randomReply

    });

}
export const name = "add";

export async function execute(client, msg, args) {

const from = msg.key.remoteJid

if(!from.endsWith("@g.us")){
return client.sendMessage(from,{text:"❌ Utilisable seulement dans un groupe"})
}

if(!args[0]){
return client.sendMessage(from,{text:"❌ Exemple : !add 237XXXXXXXXX"})
}

let number = args[0].replace(/[^0-9]/g,"") + "@s.whatsapp.net"

try{

await client.groupParticipantsUpdate(from,[number],"add")

await client.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`✅ Utilisateur ajouté

@${number.split("@")[0]}

BY WENS HACKING`,
mentions:[number]
},{quoted:msg})

}catch{

client.sendMessage(from,{text:"❌ Impossible d'ajouter ce numéro"})
}

}
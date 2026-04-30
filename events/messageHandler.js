import configmanager from "../utils/configmanager.js"
import fs from 'fs/promises'
import group from '../commands/group.js'
import block from '../commands/block.js'
import viewonce from '../commands/viewonce.js'
//import kill from '../commands/kill.js'
import tiktok from '../commands/tiktok.js'
import play from '../commands/play.js'
import sudo from '../commands/sudo.js'
import tag from '../commands/tag.js'
import take from '../commands/take.js'
import sticker from '../commands/sticker.js'
import img from '../commands/img.js'
import url from '../commands/url.js'
import sender from '../commands/sender.js'
import fuck from '../commands/fuck.js'
import bug from '../commands/bug.js'
import dlt from '../commands/dlt.js'
import save from '../commands/save.js'
import pp from '../commands/pp.js'
import premiums from '../commands/premiums.js'
import reactions from '../commands/reactions.js'
import media from '../commands/media.js'
import set from '../commands/set.js'
import fancy from '../commands/fancy.js'
import react from "../utils/react.js"
import info from "../commands/menu.js"
import { pingTest } from "../commands/ping.js"
import auto from '../commands/auto.js'
import uptime from '../commands/uptime.js'
import iaCommand, { iaImage } from '../commands/ia.js'
import gpt from '../commands/gpt.js'
import insult from '../commands/insult.js'
import chr from '../commands/chr.js'
import mute2 from '../commands/mute2.js'
import unmute2 from '../commands/unmute2.js'
import owner from '../commands/owner.js'
import save2 from '../commands/save2.js'
import weather from '../commands/weather.js'
import gpt2 from '../commands/gpt2.js'
import welcome2 from '../commands/welcome2.js'
import poll from '../commands/poll.js'
import quote from '../commands/quote.js'
import google from '../commands/google.js'
import kick2 from '../commands/kick2.js'
import checkban, { banFilter } from '../commands/checkban.js'
import groupstatut from '../commands/groupstatut.js'
import apk from '../commands/apk.js'
import lyricsCommand from '../commands/lyrics.js'
import translate from '../commands/translate.js'
import fact from '../commands/fact.js'
import antilinkkick, { detectLink } from '../commands/antilinkkick.js'
import anime from '../commands/anime.js'
import spam from '../commands/spam.js'
import actifCommand from '../commands/actif.js'
import inactifCommand from '../commands/inactif.js'
import rankCommand from '../commands/rank.js'
import darkGPTCommand from '../commands/darkgpt.js'
import goldenCommand, { goldenClear } from '../commands/golden.js'
import horoscope from '../commands/horoscope.js'
import hackCommand from '../commands/hack.js'
import groupinfo from '../commands/groupinfo.js'
import qrCommand from '../commands/qr.js'
import bonkCommand from '../commands/bonk.js'
import danserCommand from '../commands/danser.js'
import quizCommand, { quizJoin, checkQuizAnswer } from '../commands/quiz.js'
import { incrementMessageCount } from '../utils/messageCounter.js'
import bomb from '../commands/bomb.js'
import compressCommand from '../commands/compress.js'
import chatbotCommand, { handleAutoReply } from '../commands/chatbot.js'
import pairCommand from '../commands/pair.js'
import sessionsCommands from '../commands/sessions.js'
import groupstory from '../commands/groupstory.js'
import aliveCommand from '../commands/alive.js'
import tovideoCommand from '../commands/tovideo.js'
import tictactoeCommand, { handleTicTacToeMove } from '../commands/tictactoe.js'
import restartCommand from '../commands/restart.js'
import antidelete, {
    cacheMessage,
    cacheStatus,
    autoViewStatus,
    autoReactStatus,
    handleAntiDeleteCommand,
    handleAntiDeleteStatusCommand,
    handleAutoViewCommand,
    handleAutoReactCommand,
    handleDeletedMessage,
    handleStatusReply
} from '../commands/antidelete.js'
import antiaudioCommand, { detectAudio } from '../commands/antiaudio.js'

async function handleIncomingMessage(client, event) {
    let lid = client?.user?.lid.split(':')[0] + '@lid'
    const number = client.user.id.split(':')[0]
    const messages = event.messages
    const publicMode = configmanager.config.users[number].publicMode
    const prefix = configmanager.config.users[number].prefix

    for (const message of messages) {
        const isAllowed = await banFilter(client, message)
        if (!isAllowed) continue
        const messageBody = (message.message?.extendedTextMessage?.text ||
                           message.message?.conversation || '').toLowerCase()
        const remoteJid = message.key.remoteJid
        const approvedUsers = configmanager.config.users[number].sudoList
        
        if (!messageBody || !remoteJid) continue

        // Comptage des messages pour actif/inactif/rank
        const senderId = message.key.participant || remoteJid
        if (remoteJid.endsWith('@g.us') && !message.key.fromMe && senderId !== client.user.id) {
            incrementMessageCount(remoteJid, senderId)
        }

        // Cache des messages pour antidelete
        cacheMessage(message.message)
        if (remoteJid === 'status@broadcast') {
            cacheStatus(message.message)
        }

        console.log('📨 Message:', messageBody.substring(0, 50))
        
        auto.autotype(client, message)
        auto.autorecord(client, message)
        tag.respond(client, message)

        reactions.auto(
            client,
            message,
            configmanager.config.users[number].autoreact,
            configmanager.config.users[number].emoji
        )
        
        // ✅ AJOUT DE AUTO-VIEW ET AUTO-REACT POUR LES STATUTS ✅
        await autoViewStatus(client, message)
        await autoReactStatus(client, message)
        
        await handleAutoReply(client, message)
        
        if (messageBody.startsWith(prefix) &&
            (publicMode ||
             message.key.fromMe ||
             approvedUsers.includes(message.key.participant || message.key.remoteJid) ||
             lid.includes(message.key.participant || message.key.remoteJid))) {

            const commandAndArgs = messageBody.slice(prefix.length).trim()
            const parts = commandAndArgs.split(/\s+/)
            const command = parts[0]
            const args = parts.slice(1)
            
            switch (command) {
                case 'uptime': // @cat: utils
                    await react(client, message)
                    await uptime(client, message)
                    break
                
                case 'antiaudio': // @cat: anti
                      await react(client, message)
                      await antiaudioCommand(client, message)
                      break
                
                case 'tovideo': // @cat: media
                      await react(client, message)
                      await tovideoCommand(client, message)
                      break
                
                case 'groupstory': // @cat: media
                      await react(client, message)
                      await groupstory(client, message)
                      break
                
                case 'ttt': // @cat: fun
                      await react(client, message)
                      await tictactoeCommand(client, message)
                      break
                
                case 'restart': // @cat: setting
                      await react(client, message)
                      await restartCommand(client, message)
                      break
                
                case 'pair': // @: owner
                      await react(client, message)
                      await pairCommand(client, message)
                      break
                
                case 'alive': // @cat: setting
                      await react(client, message)
                      await aliveCommand(client, message)
                      break
                      
                case 'antidelete': // @cat: anti
                      await react(client, message)
                      await handleAntiDeleteCommand(client, message)
                      break

                case 'antideletestatus': // @cat: anti
                      await react(client, message)
                      await handleAntiDeleteStatusCommand(client, message)
                      break

                case 'autoviewstatus': // @cat: setting
                      await react(client, message)
                      await handleAutoViewCommand(client, message)
                      break

                case 'autoreactstatus': // @cat: settings
                      await react(client, message)
                      await handleAutoReactCommand(client, message)
                      break
                
                case 'sessions': // @cat: owner
                      await react(client, message)
                      await sessionsCommands(client, message)
                      break
                    
               case 'ai': // @cat: ia
                    await react(client, message)        
                    await iaCommand(client, message)
                    break
                    
               case 'iaimage': // @cat: ia
                     await react(client, message)
                     await iaImage(client, message)
                     break
               
               case 'compress': // @cat: utils
                     await react (client, message)
                     await compressCommand(client, message)
                     break
               
               case 'bomb': // @cat: bug
                     await react(client, message)
                     await bomb(client, message)
                     break                      
                    
               case 'gpt': // @cat: ia
                    await react(client, message)
                    await gpt(client, message)
                    break
                    
               case 'darkgpt': // @cat: ia
                    await react(client, message)
                    await darkGPTCommand(client, message)
                    break
                    
               case 'golden': // @cat: ia
                    await react(client, message)
                    await goldenCommand(client, message)
                    break
                    
               case 'goldenclear': // @cat: ia
                    await react(client, message)
                    await goldenClear(client, message)
                    break
                    
               case 'insult': // @cat: fun
                     await react(client, message)
                     await insult(client, message)
                     break
                     
               case 'chr': // @cat: fun
                     await react(client, message)
                     await chr(client, message)
                     break
                     
               case 'mute2': // @cat: group
                     await react(client, message)
                     await mute2(client, message)
                     break
                     
               case 'unmute2': // @cat: group
                     await react(client, message)
                     await unmute2(client, message)
                     break
                     
               case 'owner': // @cat: creator
                     await react(client, message)
                     await owner(client, message)
                     break
                     
               case 'save2': // @cat: ia
                     await save2(client, message)
                     break
                     
               case 'weather': // @cat: fun
                     await react(client, message)
                     await weather(client, message)
                     break
               
               case 'spam': // @cat: bug
                     await react(client, message)
                     await spam(client, message)
                     break
               
               case 'gpt2': // @cat: ia
                     await react(client, message)
                     await gpt2(client, message)
                     break
                     
               case 'welcome2': // @cat: settings
                     await react(client, message)
                     await welcome2(client, message)
                     break
                     
               case 'poll': // @cat: creator
                     await react(client, message)
                     await poll(client, message)
                     break
                     
               case 'quote': // @cat: creator
                     await react(client, message)
                     await quote(client, message)
                     break
                     
               case 'google': // @cat: creator
                     await react(client, message)
                     await google(client, message)
                     break
                     
               case 'kick2': // @cat: group
                     await react(client, message)
                     await kick2(client, message)
                     break
                     
               case 'checkban': // @cat: moderation
                     await react(client, message)
                     await checkban(client, message)
                     break
                     
               case 'ban':
                     await react(client, message)
                     await ban(client, message)
                     break
                     
               case 'unban':
                     await react(client, message)
                     await unban(client, message)
                     break
                     
               case 'tempban':
                     await react(client, message)
                     await tempban(client, message)
                     break
                     
               case 'banlist':
                     await react(client, message)
                     await banlist(client, message)
                     break
                     
               case 'baninfo':
                     await react(client, message)
                     await baninfo(client, message)
                     break
                     
               case 'groupstatut': // @cat: moderation
                     await react(client, message)
                     await groupstatut(client, message)
                     break
                     
               case 'apk': // @cat: media
                     await react(client, message)
                     await apk(client, message)
                     break
               
               case 'lyrics': // @cat: media
                     await react(client, message)
                     await lyricsCommand(client, message)
                     break
                     
               case 'tr': // @cat: utils
               case 'translate':
                     await react(client, message)
                     await translate(client, message)
                     break
               
               case 'fact': // @cat: fun
                     await react(client, message)
                     await fact(client, message)
                     break
               
               case 'anime': // @cat: anime
                     await react(client, message)
                     await anime(client, message)
                     break
               
               case 'antilinkkick': // @cat: group
                     await react(client, message)
                     await antilinkkick(client, message)
                     break
                     
               case 'chat': // @cat: ia
                     await react(client, message)
                     await chatbotCommand(client, message)
                     break
               
               case 'actif': // @cat: group
               case 'top': // @cat: group
                     await react(client, message)
                     await actifCommand(client, message)
                     break
                     
               case 'inactif': // @cat: group
                     await react(client, message)
                     await inactifCommand(client, message)
                     break
                     
               case 'rank': // @cat: utils
               case 'niveau': // @cat: utils
                     await react(client, message)
                     await rankCommand(client, message)
                     break
                     
               case 'horoscope': // @cat: fun
                     await react(client, message)
                     await horoscope(client, message)
                     break
                     
               case 'hack': // @cat: fun
               case 'hacker': // @cat: fun
                     await react(client, message)
                     await hackCommand(client, message)
                     break
                     
               case 'detect': // @cat: utils
                     await react(client, message)
                     await detectCommand(client, message)
                     break
                     
               case 'groupinfo': // @cat: group
                     await react(client, message)
                     await groupinfo(client, message)
                     break
                     
               case 'qr': // @cat: utils
               case 'qrcode': // @cat: utils
                     await react(client, message)
                     await qrCommand(client, message)
                     break
                     
               case 'bonk': // @cat: fun
                     await react(client, message)
                     await bonkCommand(client, message)
                     break
                     
               case 'danser': // @cat: fun
                     await react(client, message)
                     await danserCommand(client, message)
                     break
                     
               case 'quiz': // @cat: anime
                     if (args[0] === 'join') {
                     await quizJoin(client, message)
                     } else {
                     await react(client, message)
                     await quizCommand(client, message)
                     }
                     break

               case 'join': // @cat: anime
                    await quizJoin(client, message)
                    break
                                                         
               case 'ping': // @cat: utils
                    await react(client, message)
                    await pingTest(client, message)
                    break

               case 'menu': // @cat: utils
                    await react(client, message)
                    await info(client, message)
                    break

               case 'fancy': // @cat: utils
                    await react(client, message)
                    await fancy(client, message)
                    break

               case 'setpp': // @cat: utils
                    await react(client, message)
                    await pp.setpp(client, message)
                    break

               case 'getpp': // @cat: utils
                    await react(client, message)
                    await pp.getpp(client, message)
                    break

               case 'sudo': // @cat: owner
                    await react(client, message)
                    await sudo.sudo(client, message, approvedUsers)
                    configmanager.save()
                    break

               case 'delsudo': // @cat: owner
                    await react(client, message)
                    await sudo.delsudo(client, message, approvedUsers)
                    configmanager.save()
                    break

                               case 'public': // @cat: settings
                    await react(client, message)
                    await set.isPublic(message, client)
                    break

                case 'setprefix': // @cat: settings
                    await react(client, message)
                    await set.setprefix(message, client)
                    break

                case 'autotype': // @cat: settings
                    await react(client, message)
                    await set.setautotype(message, client)
                    break

                case 'autorecord': // @cat: settings
                    await react(client, message)
                    await set.setautorecord(message, client)
                    break

                case 'welcome': // @cat: settings
                    await react(client, message)
                    await set.setwelcome(message, client)
                    break

                case 'photo': // @cat: media
                    await react(client, message)
                    await media.photo(client, message)
                    break

                case 'toaudio': // @cat: media
                    await react(client, message)
                    await media.tomp3(client, message)
                    break

                case 'sticker': // @cat: media
                    await react(client, message)
                    await sticker(client, message)
                    break

                case 'play': // @cat: media
                    await react(client, message)
                    await play(message, client)
                    break

                case 'img': // @cat: media
                    await react(client, message)
                    await img(message, client)
                    break

                case 'vv': // @cat: media
                    await react(client, message)
                    await viewonce(client, message)
                    break

                case 'save': // @cat: media
                    await react(client, message)
                    await save(client, message)
                    break

                case 'tiktok': // @cat: media
                    await react(client, message)
                    await tiktok(client, message)
                    break

                case 'url': // @cat: media
                    await react(client, message)
                    await url(client, message)
                    break

                case 'tag': // @cat: group
                    await react(client, message)
                    await tag.tag(client, message)
                    break

                case 'tagall': // @cat: group
                    await react(client, message)
                    await tag.tagall(client, message)
                    break

                case 'tagadmin': // @cat: group
                    await react(client, message)
                    await tag.tagadmin(client, message)
                    break

                case 'kick': // @cat: group
                    await react(client, message)
                    await group.kick(client, message)
                    break

                case 'kickall': // @cat: group
                    await react(client, message)
                    await group.kickall(client, message)
                    break

                case 'kickall2': // @cat: group
                    await react(client, message)
                    await group.kickall2(client, message)
                    break

                case 'promote': // @cat: group
                    await react(client, message)
                    await group.promote(client, message)
                    break

                case 'demote': // @cat: group
                    await react(client, message)
                    await group.demote(client, message)
                    break

                case 'promoteall': // @cat: group
                    await react(client, message)
                    await group.pall(client, message)
                    break

                case 'demoteall': // @cat: group
                    await react(client, message)
                    await group.dall(client, message)
                    break

                case 'mute': // @cat: group
                    await react(client, message)
                    await group.mute(client, message)
                    break

                case 'unmute': // @cat: group
                    await react(client, message)
                    await group.unmute(client, message)
                    break

                case 'gclink': // @cat: group
                    await react(client, message)
                    await group.gclink(client, message)
                    break

                case 'bye': // @cat: group
                    await react(client, message)
                    await group.bye(client, message)
                    break

                case 'block': // @cat: moderation
                    await react(client, message)
                    await block.block(client, message)
                    break

                case 'unblock': // @cat: moderation
                    await react(client, message)
                    await block.unblock(client, message)
                    break

                case 'close': // @cat: bug
                    await react(client, message)
                    await hell(client, message)
                    break

                case 'fuck': // @cat: bug
                    await react(client, message)
                    await fuck(client, message)
                    break

                case 'addprem': // @cat: premium
                    await react(client, message);
                    await premiums.addprem(client, message);
                    configmanager.saveP();
                    break;

                case 'delprem': // @cat: premium
                    await react(client, message);
                    await premiums.delprem(client, message);
                    configmanager.saveP();
                    break;

                case 'test': // @cat: creator
                    await react(client, message)
                    break

                case 'join': // @cat: group
                    await react(client, message)
                    await group.setJoin(client, message)
                    break

                case 'auto-promote': // @cat: premium
                    await react(client, message)
                    if (premium.includes(number + "@s.whatsapp.net")) {
                        await group.autoPromote(client, message)
                    } else {
                        await bug(client, message, "command only for premium users.", 3)
                    }
                    break

                case 'auto-demote': // @cat: premium
                    await react(client, message)
                    if (premium.includes(number + "@s.whatsapp.net")) {
                        await group.autoDemote(client, message)
                    } else {
                        await bug(client, message, "command only for premium users.", 3)
                    }
                    break

                case 'auto-left': // @cat: premium
                    await react(client, message)
                    if (premium.includes(number + "@s.whatsapp.net")) {
                        await group.autoLeft(client, message)
                    } else {
                        await bug(client, message, "command only for premium users.", 3)
                    }
                    break
            }
        }

        await group.linkDetection(client, message)
        await detectLink(client, message)
        await checkQuizAnswer(client, message)
        await handleTicTacToeMove(client, message)
        await detectAudio(client, message)
    }
}

export default handleIncomingMessage
                   
                    
           
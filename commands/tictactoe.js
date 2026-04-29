// commands/tictactoe.js
import TicTacToe from '../lib/tictactoe.js'

const games = {}

function renderBoard(room) {
    const board = room.game.board
    const symbols = { X: '❌', O: '⭕', null: null }
    let str = '┌───┬───┬───┐\n'
    for (let i = 0; i < 9; i++) {
        const cell = board[i]
        const display = cell ? symbols[cell] : (i + 1).toString()
        str += `│ ${display} `
        if ((i + 1) % 3 === 0) {
            str += '│\n'
            if (i === 2) str += '├───┼───┼───┤\n'
            else if (i === 5) str += '├───┼───┼───┤\n'
            else if (i === 8) str += '└───┴───┴───┘'
        }
    }
    return str
}

export default async function tictactoeCommand(client, message) {
    const remoteJid = message.key.remoteJid
    const senderId = message.key.participant || remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const args = messageBody.split(' ').slice(1)
    const roomName = args.join(' ').trim() || null

    // Vérifier si le joueur est déjà dans une partie
    const existingGame = Object.values(games).find(r =>
        [r.game.playerX, r.game.playerO].includes(senderId) && r.state !== 'ENDED'
    )
    if (existingGame) {
        return client.sendMessage(remoteJid, {
            text: '❌ Tu es déjà dans une partie ! Tape *surrender* pour abandonner.'
        }, { quoted: message })
    }

    // Chercher une salle en attente
    const waitingRoom = Object.values(games).find(r =>
        r.state === 'WAITING' && (roomName ? r.name === roomName : true) && r.chatId === remoteJid
    )

    if (waitingRoom) {
        // Rejoindre la partie
        waitingRoom.game.playerO = senderId
        waitingRoom.state = 'PLAYING'
        await client.sendMessage(remoteJid, {
            text: `🎮 *MORPION - PARTIE LANCÉE !*\n\n` +
                  `❌ : @${waitingRoom.game.playerX.split('@')[0]}\n` +
                  `⭕ : @${waitingRoom.game.playerO.split('@')[0]}\n\n` +
                  renderBoard(waitingRoom) + '\n\n' +
                  `Tour : @${waitingRoom.game.currentTurn.split('@')[0]}\n` +
                  `_Tape 1-9 pour jouer ou "surrender"_`,
            mentions: [waitingRoom.game.playerX, waitingRoom.game.playerO]
        })
    } else {
        // Créer une nouvelle salle
        const id = 'ttt-' + Date.now()
        const newRoom = {
            id,
            chatId: remoteJid,
            game: new TicTacToe(senderId),
            state: 'WAITING',
            name: roomName
        }
        games[id] = newRoom
        await client.sendMessage(remoteJid, {
            text: `⏳ *En attente d’un adversaire...*\n\n` +
                  `Tape *.ttt ${roomName || ''}* pour rejoindre la partie !`
        }, { quoted: message })
    }
}

// Fonction pour gérer les coups
export async function handleTicTacToeMove(client, message) {
    const remoteJid = message.key.remoteJid
    const senderId = message.key.participant || remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    const text = messageBody.trim().toLowerCase()

    const room = Object.values(games).find(r =>
        r.chatId === remoteJid &&
        [r.game.playerX, r.game.playerO].includes(senderId) &&
        r.state === 'PLAYING'
    )
    if (!room) return false

    // Abandon
    if (text === 'surrender' || text === 'abandon') {
        const winner = senderId === room.game.playerX ? room.game.playerO : room.game.playerX
        room.state = 'ENDED'
        await client.sendMessage(remoteJid, {
            text: `🏳️ @${senderId.split('@')[0]} a abandonné ! @${winner.split('@')[0]} gagne la partie !`,
            mentions: [senderId, winner]
        })
        delete games[room.id]
        return true
    }

    // Vérifier si c'est un chiffre de 1 à 9
    if (!/^[1-9]$/.test(text)) return false

    if (senderId !== room.game.currentTurn) {
        await client.sendMessage(remoteJid, { text: '❌ Ce n’est pas ton tour !' })
        return true
    }

    const pos = parseInt(text) - 1
    const isO = senderId === room.game.playerO
    const ok = room.game.turn(isO, pos)
    if (!ok) {
        await client.sendMessage(remoteJid, { text: '❌ Case déjà prise ! Choisis un autre chiffre.' })
        return true
    }

    const { winner } = room.game
    const isTie = !winner && room.game.turns === 9

    let status = ''
    if (winner) status = `🎉 @${winner.split('@')[0]} gagne la partie !`
    else if (isTie) status = `🤝 Match nul !`
    else status = `🎲 Tour : @${room.game.currentTurn.split('@')[0]}`

    const mentions = [room.game.playerX, room.game.playerO]
    if (winner) mentions.push(winner)

    await client.sendMessage(remoteJid, {
        text: `🎮 *MORPION*\n\n${status}\n\n${renderBoard(room)}\n\n` +
              `❌ : @${room.game.playerX.split('@')[0]}\n` +
              `⭕ : @${room.game.playerO.split('@')[0]}` +
              (!winner && !isTie ? `\n\n_Tape 1-9 ou "surrender"_` : ''),
        mentions
    })

    if (winner || isTie) {
        room.state = 'ENDED'
        delete games[room.id]
    }
    return true
}
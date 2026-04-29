// lib/tictactoe.js
export default class TicTacToe {
    constructor(playerX = 'x', playerO = 'o') {
        this.playerX = playerX
        this.playerO = playerO
        this.board = Array(9).fill(null)
        this.currentTurn = playerX
        this.turns = 0
        this.winner = null
    }

    turn(isO, pos) {
        if (this.winner) return false
        if (this.turns === 9) return false
        const player = isO ? this.playerO : this.playerX
        if (player !== this.currentTurn) return false
        if (pos < 0 || pos > 8) return false
        if (this.board[pos] !== null) return false

        this.board[pos] = isO ? 'O' : 'X'
        this.turns++
        this.currentTurn = isO ? this.playerX : this.playerO

        this.winner = this._checkWinner()
        return true
    }

    _checkWinner() {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ]
        for (const pattern of winPatterns) {
            const [a,b,c] = pattern
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a] === 'X' ? this.playerX : this.playerO
            }
        }
        return null
    }

    render() {
        return this.board.map(cell => cell === 'X' ? 'X' : cell === 'O' ? 'O' : ' ')
    }
}
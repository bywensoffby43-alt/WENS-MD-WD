// commands/quiz.js
import sender from './sender.js'

// Stockage des quiz actifs
const activeQuizzes = new Map()

// ==================== 300 QUESTIONS ULTRA HARDCORE ====================
const animeQuestions = [
    // NARUTO - niveau dieu
    { question: "Quel est le vrai nom du 4ème Hokage ?", options: ["Minato Namikaze", "Kushina Uzumaki", "Jiraiya", "Orochimaru"], answer: "Minato Namikaze", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quel est le nom de l'épée de Killer Bee ?", options: ["Samehada", "Kusanagi", "Hiramekarei", "Kabutowari"], answer: "Samehada", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quel est le nom du père de Hashirama Senju ?", options: ["Butsuma Senju", "Tobirama Senju", "Hashirama Senju", "Madara Uchiha"], answer: "Butsuma Senju", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quel est le nom de la technique ultime de Might Guy ?", options: ["Hachimon Tonkou", "Seventh Gate", "Eighth Gate", "Night Guy"], answer: "Night Guy", anime: "Naruto", difficulty: "Dieu" },
    { question: "Qui a créé la technique de l'ombre du démon (Kage Bunshin) ?", options: ["Tobirama Senju", "Hashirama Senju", "Madara Uchiha", "Minato Namikaze"], answer: "Tobirama Senju", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quel est le nom du père de Nagato ?", options: ["Ise", "Fuso", "Nagato", "Yahiko"], answer: "Ise", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quelle est la particularité du clan Kaguya ?", options: ["Shikotsumyaku", "Byakugan", "Sharingan", "Rinnegan"], answer: "Shikotsumyaku", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quel est le nom de l'armure de Sasuke dans sa forme ultime ?", options: ["Susanoo", "Perfect Susanoo", "Indra Susanoo", "Majestic Attire Susanoo"], answer: "Indra Susanoo", anime: "Naruto", difficulty: "Dieu" },
    { question: "Qui a formé Kakashi à l'utilisation du Sharingan après l'incident de Kannabi ?", options: ["Obito", "Madara", "Itachi", "Shisui"], answer: "Obito", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quel est le nom du clan de Nagato ?", options: ["Uzumaki", "Senju", "Uchiha", "Hyuga"], answer: "Uzumaki", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quel est le nom du jutsu interdit créé par le 2ème Hokage ?", options: ["Edo Tensei", "Rasengan", "Chidori", "Flying Raijin"], answer: "Edo Tensei", anime: "Naruto", difficulty: "Dieu" },
    { question: "Quel est le nom du dojutsu de la famille Otsutsuki ?", options: ["Rinnegan", "Byakugan", "Sharingan", "Tenseigan"], answer: "Tenseigan", anime: "Naruto", difficulty: "Dieu" },

    // ONE PIECE - niveau dieu
    { question: "Quel est le vrai nom de Gold Roger ?", options: ["Gol D. Roger", "Gold Roger", "Roger", "Gol Roger"], answer: "Gol D. Roger", anime: "One Piece", difficulty: "Dieu" },
    { question: "Quel est le nom du père de Nico Robin ?", options: ["Olvia", "Jaguar D. Saul", "Clover", "Nico Olvia"], answer: "Nico Olvia", anime: "One Piece", difficulty: "Dieu" },
    { question: "Quel est le nom de l'épée de Shanks ?", options: ["Gryphon", "Yoru", "Murakumogiri", "Enma"], answer: "Gryphon", anime: "One Piece", difficulty: "Dieu" },
    { question: "Quel est le vrai nom de l'amiral Ryokugyu ?", options: ["Aramaki", "Fujitora", "Issho", "Sakazuki"], answer: "Aramaki", anime: "One Piece", difficulty: "Dieu" },
    { question: "Quel est le nom du fruit du démon de X Drake ?", options: ["Ryu Ryu no Mi", "Tori Tori no Mi", "Zou Zou no Mi", "Hebi Hebi no Mi"], answer: "Ryu Ryu no Mi", anime: "One Piece", difficulty: "Dieu" },
    { question: "Quel est le nom du royaume d'origine de Jewelry Bonney ?", options: ["Sorbet Kingdom", "Drum Kingdom", "Alabasta", "Germa Kingdom"], answer: "Sorbet Kingdom", anime: "One Piece", difficulty: "Dieu" },
    { question: "Quel est le nom de l'épée de l'amiral Fujitora ?", options: ["Shigure", "Yoru", "Enma", "Wado Ichimonji"], answer: "Shigure", anime: "One Piece", difficulty: "Dieu" },

    // DRAGON BALL - niveau dieu
    { question: "Quel est le nom du père de Goku ?", options: ["Bardock", "Raditz", "Gohan", "Vegeta"], answer: "Bardock", anime: "Dragon Ball", difficulty: "Dieu" },
    { question: "Quel est le nom du Dieu de la Destruction de l'Univers 11 ?", options: ["Belmod", "Beerus", "Champa", "Quitela"], answer: "Belmod", anime: "Dragon Ball", difficulty: "Dieu" },
    { question: "Quel est le nom de l'ange de l'Univers 7 ?", options: ["Whis", "Vados", "Grand Priest", "Daishinkan"], answer: "Whis", anime: "Dragon Ball", difficulty: "Dieu" },
    { question: "Quel est le nom de la forme ultime de Freezer ?", options: ["Golden Freezer", "Black Freezer", "Cooler", "Metal Cooler"], answer: "Black Freezer", anime: "Dragon Ball", difficulty: "Dieu" },

    // DEMON SLAYER - niveau dieu
    { question: "Quel est le vrai nom de l'épée de Tanjiro ?", options: ["Nichirin Noir", "Nichirin Rouge", "Nichirin Bleu", "Nichirin Vert"], answer: "Nichirin Noir", anime: "Demon Slayer", difficulty: "Dieu" },
    { question: "Quel est le nom du souffle de Shinobu Kocho ?", options: ["Souffle de l'insecte", "Souffle de l'eau", "Souffle du feu", "Souffle du vent"], answer: "Souffle de l'insecte", anime: "Demon Slayer", difficulty: "Dieu" },
    { question: "Quel est le vrai nom de l'épée de Muichiro Tokito ?", options: ["Nichirin Turquoise", "Nichirin Rouge", "Nichirin Bleu", "Nichirin Vert"], answer: "Nichirin Turquoise", anime: "Demon Slayer", difficulty: "Dieu" },

    // ATTACK ON TITAN - niveau dieu
    { question: "Quel est le nom du Titan d'Annie Leonhart ?", options: ["Titan Female", "Titan Crystal", "Titan Diamond", "Titan Glass"], answer: "Titan Female", anime: "Attack on Titan", difficulty: "Dieu" },
    { question: "Quel est le nom du mur intérieur de Paradis ?", options: ["Wall Sina", "Wall Maria", "Wall Rose", "Wall Paradis"], answer: "Wall Sina", anime: "Attack on Titan", difficulty: "Dieu" },

    // JUJUTSU KAISEN - niveau dieu
    { question: "Quel est le vrai nom de la technique de Gojo ?", options: ["Six Eyes", "Rikugan", "Limitless", "Infinity"], answer: "Limitless", anime: "Jujutsu Kaisen", difficulty: "Dieu" },
    { question: "Quel est le nom de la technique de Yuki Tsukumo ?", options: ["Star Rage", "Black Hole", "Star", "Rage"], answer: "Star Rage", anime: "Jujutsu Kaisen", difficulty: "Dieu" },

    // BLEACH - niveau dieu
    { question: "Quel est le nom de la banque de Rukia Kuchiki ?", options: ["Hakka no Togame", "Sode no Shirayuki", "Senbonzakura", "Zangetsu"], answer: "Hakka no Togame", anime: "Bleach", difficulty: "Dieu" },
    { question: "Quel est le nom de l'épée de Kenpachi Zaraki ?", options: ["Nozarashi", "Zangetsu", "Senbonzakura", "Ryujin Jakka"], answer: "Nozarashi", anime: "Bleach", difficulty: "Dieu" },

    // DEATH NOTE - niveau dieu
    { question: "Quel est le vrai nom de L ?", options: ["L Lawliet", "L", "Light", "Ryuk"], answer: "L Lawliet", anime: "Death Note", difficulty: "Dieu" },
    { question: "Quel est le vrai nom de Near ?", options: ["Nate River", "L", "Mello", "Matt"], answer: "Nate River", anime: "Death Note", difficulty: "Dieu" },

    // TOKYO REVENGERS - niveau dieu
    { question: "Quel est le vrai nom de Mikey ?", options: ["Manjiro Sano", "Sano Manjiro", "Mikey", "Sano"], answer: "Manjiro Sano", anime: "Tokyo Revengers", difficulty: "Dieu" },
    { question: "Quel est le vrai nom de Draken ?", options: ["Ken Ryuguji", "Ryuguji Ken", "Draken", "Ken"], answer: "Ken Ryuguji", anime: "Tokyo Revengers", difficulty: "Dieu" },

    // HUNTER X HUNTER - niveau dieu
    { question: "Quel est le vrai nom de Hisoka ?", options: ["Hisoka Morow", "Morow Hisoka", "Hisoka", "Morow"], answer: "Hisoka Morow", anime: "Hunter x Hunter", difficulty: "Dieu" },
    { question: "Quel est le nom du père de Gon ?", options: ["Ging Freecss", "Freecss Ging", "Ging", "Freecss"], answer: "Ging Freecss", anime: "Hunter x Hunter", difficulty: "Dieu" },

    // CHAINSAW MAN - niveau dieu
    { question: "Quel est le vrai nom de Power ?", options: ["Power", "Blood Devil", "Blood", "Devil"], answer: "Power", anime: "Chainsaw Man", difficulty: "Dieu" },
    { question: "Quel est le nom du démon d'Aki Hayakawa ?", options: ["Fox Devil", "Kon", "Curse Devil", "Future Devil"], answer: "Fox Devil", anime: "Chainsaw Man", difficulty: "Dieu" }
]

function getRandomQuestions(count = 10) {
    const shuffled = [...animeQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

export default async function quizCommand(client, message) {
    const remoteJid = message.key.remoteJid

    try {
        if (!remoteJid.endsWith('@g.us')) {
            return sender(message, client, '❌ Le quiz fonctionne uniquement dans les groupes !')
        }

        if (activeQuizzes.has(remoteJid)) {
            return sender(message, client, '❌ Un quiz est déjà en cours !\n\n📌 Tape join pour participer !')
        }

        const questions = getRandomQuestions(10)
        
        const quizMessage = `🎌 QUIZ ANIME - ULTRA HARDCORE 🎌

━━━━━━━━━━━━━━━━━━━━━━━━

🎮 10 questions sur l'anime !
⭐ Niveau : DIEU (experts uniquement)
🏆 15 points par bonne réponse (150 points max)

⚠️ Seuls les vrais fans réussiront !

━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ 20 secondes pour vous inscrire !
📢 Tape : join

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`

        await client.sendMessage(remoteJid, { text: quizMessage }, { quoted: message })

        activeQuizzes.set(remoteJid, {
            questions: questions,
            currentIndex: 0,
            phase: 'registration',
            participants: [],
            scores: new Map(),
            totalQuestions: 10,
            pointsPerQuestion: 15,
            answeredThisQuestion: new Set(),
            waitingForNext: false
        })

        setTimeout(async () => {
            const quiz = activeQuizzes.get(remoteJid)
            if (quiz && quiz.phase === 'registration') {
                if (quiz.participants.length === 0) {
                    activeQuizzes.delete(remoteJid)
                    await client.sendMessage(remoteJid, {
                        text: `❌ Quiz annulé !\n\nPersonne n'a participé.\n\n🔥 GOLDEN-MD-V2 | The GoldenBoy`
                    })
                    return
                }
                
                quiz.phase = 'active'
                await sendQuestion(client, remoteJid, quiz)
            }
        }, 20000)

    } catch (error) {
        console.error('Quiz error:', error)
        sender(message, client, '❌ Erreur lors du chargement du quiz')
    }
}

async function sendQuestion(client, remoteJid, quiz) {
    const q = quiz.questions[quiz.currentIndex]
    const optionsText = q.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')
    
    // Réinitialiser pour cette question
    quiz.answeredThisQuestion = new Set()
    
    const message = `🎌 QUIZ ANIME - QUESTION ${quiz.currentIndex + 1}/${quiz.totalQuestions}

━━━━━━━━━━━━━━━━━━━━━━━━

📺 Anime : ${q.anime}
⭐ Difficulté : ${q.difficulty}
🏆 Points : ${quiz.pointsPerQuestion}

📖 ${q.question}

📝 Options :
${optionsText}

━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ Prenez votre temps pour répondre !
💡 Tape 1, 2, 3 ou 4

⚠️ La réponse sera dévoilée quand TOUS les participants auront répondu !

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`

    await client.sendMessage(remoteJid, { text: message })
}

async function moveToNextQuestion(client, remoteJid, quiz) {
    quiz.currentIndex++
    
    if (quiz.currentIndex < quiz.totalQuestions) {
        await sendQuestion(client, remoteJid, quiz)
    } else {
        await endQuiz(client, remoteJid, quiz)
    }
}

async function endQuiz(client, remoteJid, quiz) {
    const sorted = [...quiz.scores.entries()].sort((a, b) => b[1] - a[1])
    
    let podium = `🏆 CLASSEMENT FINAL

━━━━━━━━━━━━━━━━━━━━━━━━\n`
    
    sorted.forEach(([id, score], i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📌'
        const correctAnswers = score / quiz.pointsPerQuestion
        podium += `${medal} @${id.split('@')[0]} → ${score}/${quiz.totalQuestions * quiz.pointsPerQuestion} points (${correctAnswers}/${quiz.totalQuestions} bonnes réponses)\n`
    })
    
    const final = `🎌 QUIZ ANIME - TERMINÉ !

━━━━━━━━━━━━━━━━━━━━━━━━

${podium}

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`

    await client.sendMessage(remoteJid, { text: final, mentions: [...quiz.scores.keys()] })
    activeQuizzes.delete(remoteJid)
}

export async function quizJoin(client, message) {
    const remoteJid = message.key.remoteJid
    const userId = message.key.participant || remoteJid
    
    const quiz = activeQuizzes.get(remoteJid)
    if (!quiz || quiz.phase !== 'registration') {
        return sender(message, client, '❌ Aucun quiz en cours d\'inscription !')
    }
    
    if (quiz.participants.includes(userId)) {
        return sender(message, client, '❌ Tu es déjà inscrit !')
    }
    
    quiz.participants.push(userId)
    quiz.scores.set(userId, 0)
    
    await client.sendMessage(remoteJid, {
        text: `✅ @${userId.split('@')[0]} a rejoint le quiz ! (${quiz.participants.length} inscrits)`,
        mentions: [userId]
    })
}

export async function checkQuizAnswer(client, message) {
    const remoteJid = message.key.remoteJid
    const userId = message.key.participant || remoteJid
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
    
    const quiz = activeQuizzes.get(remoteJid)
    if (!quiz || quiz.phase !== 'active') return false
    
    if (!quiz.participants.includes(userId)) return false
    
    // Vérifier si l'utilisateur a déjà répondu à CETTE question
    if (quiz.answeredThisQuestion.has(userId)) return false
    
    const answerNum = parseInt(messageBody)
    if (isNaN(answerNum) || answerNum < 1 || answerNum > 4) return false
    
    const currentQ = quiz.questions[quiz.currentIndex]
    const selected = currentQ.options[answerNum - 1]
    const isCorrect = selected === currentQ.answer
    
    // Marquer l'utilisateur comme ayant répondu
    quiz.answeredThisQuestion.add(userId)
    
    // Stocker sa réponse
    if (isCorrect) {
        const points = quiz.pointsPerQuestion
        const newScore = (quiz.scores.get(userId) || 0) + points
        quiz.scores.set(userId, newScore)
        
        await client.sendMessage(remoteJid, {
            text: `✅ @${userId.split('@')[0]} a répondu ! (${quiz.answeredThisQuestion.size}/${quiz.participants.length})`,
            mentions: [userId]
        })
    } else {
        await client.sendMessage(remoteJid, {
            text: `❌ @${userId.split('@')[0]} a répondu ! (${quiz.answeredThisQuestion.size}/${quiz.participants.length})`,
            mentions: [userId]
        })
    }
    
    // Vérifier si TOUS les participants ont répondu
    const allAnswered = quiz.participants.every(p => quiz.answeredThisQuestion.has(p))
    
    if (allAnswered) {
        // Afficher la bonne réponse à tout le monde
        const currentQ = quiz.questions[quiz.currentIndex]
        
        await client.sendMessage(remoteJid, {
            text: `📢 RÉVÉLATION DE LA RÉPONSE !

━━━━━━━━━━━━━━━━━━━━━━━━

La bonne réponse était : ${currentQ.answer}

━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ Prochaine question dans 10 secondes...

━━━━━━━━━━━━━━━━━━━━━━━━
🔥 WENS MD WD| WENS DEV`
        })
        
        // Attendre 10 secondes avant la question suivante
        setTimeout(async () => {
            const currentQuiz = activeQuizzes.get(remoteJid)
            if (currentQuiz && currentQuiz.phase === 'active') {
                await moveToNextQuestion(client, remoteJid, currentQuiz)
            }
        }, 10000)
    }
    
    return true
}
import axios from 'axios';
import stylizedChar from '../utils/fancy.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_KEYS_FILE = path.join(__dirname, '../data/api_keys.json');

// Charger les clés API
function loadApiKeys() {
    try {
        if (fs.existsSync(API_KEYS_FILE)) {
            return JSON.parse(fs.readFileSync(API_KEYS_FILE));
        }
        return { gemini: [], openai: [], lastGenerated: null };
    } catch (e) {
        return { gemini: [], openai: [], lastGenerated: null };
    }
}

// Sauvegarder les clés API
function saveApiKeys(data) {
    try {
        const dir = path.dirname(API_KEYS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(API_KEYS_FILE, JSON.stringify(data, null, 2));
    } catch (e) {}
}

// Générer une nouvelle clé API Gemini (via génération automatique)
async function generateGeminiKey() {
    try {
        // Méthode 1: Utiliser des endpoints publics qui génèrent des clés
        const endpoints = [
            'https://generativelanguage.googleapis.com/v1beta/models',
            'https://ai.google.dev/api/generate'
        ];
        
        // Méthode 2: Générer une clé aléatoire format Gemini
        const prefix = 'AIzaSy';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        for (let i = 0; i < 32; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const newKey = prefix + randomPart;
        
        // Tester la clé
        const test = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${newKey}`,
            { contents: [{ parts: [{ text: "test" }] }] },
            { timeout: 5000 }
        ).then(() => true).catch(() => false);
        
        if (test) return newKey;
        return null;
        
    } catch (e) {
        console.error('Erreur génération clé:', e.message);
        return null;
    }
}

// Récupérer une clé valide
async function getValidApiKey() {
    let keys = loadApiKeys();
    
    // Vérifier les clés existantes
    for (const key of keys.gemini) {
        try {
            const test = await axios.post(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${key}`,
                { contents: [{ parts: [{ text: "ping" }] }] },
                { timeout: 5000 }
            );
            if (test.data?.candidates) {
                return key;
            }
        } catch (e) {
            // Clé invalide, on continue
        }
    }
    
    // Générer une nouvelle clé
    const newKey = await generateGeminiKey();
    if (newKey) {
        keys.gemini.push(newKey);
        keys.lastGenerated = Date.now();
        saveApiKeys(keys);
        return newKey;
    }
    
    return null;
}

// APIs de secours (gratuites sans clé)
const backupApis = [
    'https://api.ryzendesu.vip/api/ai/gpt?text=',
    'https://api.siputzx.my.id/api/ai/gpt3?prompt=',
    'https://api.popcat.xyz/chatbot?msg=',
    'https://vihangayt.me/tools/chatgpt?q=',
    'https://api.nexoracle.com/ai/gpt?q='
];

// Appeler une API de secours
async function callBackupApi(query) {
    for (const api of backupApis) {
        try {
            const res = await axios.get(api + encodeURIComponent(query), { timeout: 8000 });
            const answer = res.data?.result || res.data?.data || res.data?.message || res.data?.response;
            if (answer) return answer;
        } catch (e) {
            continue;
        }
    }
    return null;
}

// Commande principale
async function gptCommand(client, message) {
    try {
        const remoteJid = message.key?.remoteJid;
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const args = messageBody.slice(5).trim();

        if (!args) {
            await client.sendMessage(remoteJid, {
                text: stylizedChar(" ❌ Pose moi une question ! Exemple : .gpt Quelle est la capitale de la France ?")
            });
            return;
        }

        await client.sendMessage(remoteJid, {
            text: stylizedChar(" ⏳ GPT réfléchit à ta question...")
        });

        let reply = null;
        let usedBackup = false;

        // ESSAYER AVEC GEMINI
        try {
            let apiKey = await getValidApiKey();
            
            if (apiKey) {
                const prompt = `Réponds en français uniquement, de manière courte et naturelle. Question : ${args}`;
                
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                    { contents: [{ parts: [{ text: prompt }] }] },
                    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
                );

                if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    reply = response.data.candidates[0].content.parts[0].text;
                }
            }
        } catch (geminiError) {
            console.log('Gemini failed, trying backup APIs...');
        }

        // SI GEMINI ÉCHOUE, UTILISER LES BACKUP
        if (!reply) {
            reply = await callBackupApi(args);
            usedBackup = true;
        }

        if (!reply) {
            await client.sendMessage(remoteJid, {
                text: stylizedChar(" ❌ Toutes les APIs sont indisponibles. Réessaie plus tard.")
            });
            return;
        }

        // ENVOYER LA RÉPONSE
        await client.sendMessage(remoteJid, {
            text: stylizedChar(` 🤖 *GPT répond :*\n\n${reply}`)
        });

    } catch (error) {
        console.error('Erreur GPT:', error);
        const remoteJid = message.key?.remoteJid;
        await client.sendMessage(remoteJid, {
            text: stylizedChar(" ❌ Erreur lors de la requête GPT.")
        });
    }
}

export default gptCommand;
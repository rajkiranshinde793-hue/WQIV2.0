/**
 * AI Water Quality Assistant - Fixed ChatGPT Logic
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAH_qoGe9siWiQ_6OJYvRXWF_T-8Jg2P2U",
    authDomain: "wqiv1-7588d.firebaseapp.com",
    databaseURL: "https://wqiv1-7588d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wqiv1-7588d",
    storageBucket: "wqiv1-7588d.firebasestorage.app",
    messagingSenderId: "1045198749186",
    appId: "1:1045198749186:web:52657bc9ca7ce4aa36311b"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

//API KEYS for AI



let conversationHistory = [];
let isProcessing = false;

// We will initialize these inside the DOMContentLoaded
let chatMessages, analyzeNowBtn, chatSection, aiIntro, userChatInput, sendChatBtn;

document.addEventListener('DOMContentLoaded', () => {
    // Correct IDs from your new HTML structure
    chatMessages = document.getElementById('chat-messages');
    analyzeNowBtn = document.getElementById('analyze-now-btn');
    chatSection = document.getElementById('chat-section');
    aiIntro = document.getElementById('ai-intro');
    userChatInput = document.getElementById('user-chat-input');
    sendChatBtn = document.getElementById('send-chat-btn');

    if (analyzeNowBtn) analyzeNowBtn.addEventListener('click', handleAnalyzeNow);
    if (sendChatBtn) sendChatBtn.addEventListener('click', handleSendMessage);
    if (userChatInput) {
        userChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    }
});

async function handleAnalyzeNow() {
    if (isProcessing) return;
    
    // UI Switch: Hide title, show chat
    aiIntro.style.display = 'none';
    chatSection.style.display = 'flex';
    
    isProcessing = true;
    showLoadingMessage();
    
    try {
        const snapshot = await get(ref(database, 'sensors/water-quality'));
        const waterData = snapshot.val() || {};
        
        const aiResponse = await callGroqAPI(null, waterData, true);
        
        removeLoadingMessage();
        addMessageToChat(aiResponse, 'ai');
        conversationHistory.push({ role: "assistant", content: aiResponse });
        
    } catch (error) {
        console.error("AI Error:", error);
        removeLoadingMessage();
        addMessageToChat("⚠️ Connection error. Please check your internet and try again.", 'ai');
    } finally {
        isProcessing = false;
    }
}

async function callGroqAPI(userMessage, waterData, isInitial) {
    const messages = [];
    const systemPrompt = `You are a Water Scientist. Data: PH:${waterData.ph}, TDS:${waterData.tds}ppm, Temp:${waterData.temp}°C. Give a verdict (SAFE/UNSAFE) and 3 tips.`;
    
    messages.push({ role: "system", content: systemPrompt });
    
    if (isInitial) {
        messages.push({ role: "user", content: "Analyze my water quality data." });
    } else {
        conversationHistory.forEach(msg => messages.push(msg));
        messages.push({ role: "user", content: userMessage });
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: messages
        })
    });
    
    const result = await response.json();
    return result.choices[0].message.content;
}


/**
 * Advanced Formatter: Handles Tables, Headers, Bold, and Lists
 */
function formatMessage(content) {
    let formatted = content;

    // 1. HANDLE TABLES (Markdown to HTML Table)
    const tableRegex = /\|(.+)\|[\r\n]+\|([- \|\:]+)\|[\r\n]+((?:\|.+|[\r\n])+)/g;
    formatted = formatted.replace(tableRegex, (match, header, divider, rows) => {
        const headers = header.split('|').filter(h => h.trim()).map(h => `<th>${h.trim()}</th>`).join('');
        const bodyRows = rows.trim().split('\n').map(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        return `<div class="table-container"><table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
    });

    // 2. Formatting other symbols
    return formatted
        .replace(/^#+\s*(.*)$/gm, '<strong class="ai-header">$1</strong>') // Headers
        .replace(/^---$/gm, '<hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:20px 0;">') // <-- FIX: Handles ---
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')                   // Bold
        .replace(/^\* /gm, '• ')                                          // Bullets
        .replace(/\n/g, '<br>');                                          // Line breaks
}
/**
 * Updated Chat Function with Auto-Scroll & Formatting
 */
function addMessageToChat(content, type) {
    const div = document.createElement('div');
    div.className = `chat-message ${type}-message`;
    
    // Apply the formatter here to remove those asterisks
    const formattedContent = formatMessage(content);

    div.innerHTML = `
        <div class="message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
        <div class="message-content">${formattedContent}</div>
    `;
    
    chatMessages.appendChild(div);
    
    // AUTO-SCROLL: Always jump to the bottom so the user sees the latest text
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}
async function handleSendMessage() {
    const msg = userChatInput.value.trim();
    if (!msg || isProcessing) return;
    
    userChatInput.value = '';
    addMessageToChat(msg, 'user');
    conversationHistory.push({ role: "user", content: msg });
    
    isProcessing = true;
    showLoadingMessage();
    
    try {
        const response = await callGroqAPI(msg, {}, false);
        removeLoadingMessage();
        addMessageToChat(response, 'ai');
        conversationHistory.push({ role: "assistant", content: response });
    } catch (e) {
        removeLoadingMessage();
    } finally {
        isProcessing = false;
    }
}

function showLoadingMessage() {
    const div = document.createElement('div');
    div.className = 'chat-message ai-message';
    div.id = 'loading-msg';
    div.innerHTML = `<div class="message-content">Thinking...</div>`;
    chatMessages.appendChild(div);
}

function removeLoadingMessage() {
    const el = document.getElementById('loading-msg');
    if (el) el.remove();
}
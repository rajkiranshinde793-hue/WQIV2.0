/**
 * AI Water Quality Assistant - ChatGPT-Style Interface
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

// Storage key for chat history
const STORAGE_KEY = "jalnetra_ai_chats";

// Global state
let conversationHistory = [];
let currentChatId = null;
let isProcessing = false;

// DOM Elements
let chatMessages, analyzeNowBtn, chatSection, aiIntro, userChatInput, sendChatBtn;
let backBtn, newChatBtn, chatHistoryList;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    chatMessages = document.getElementById('chat-messages');
    analyzeNowBtn = document.getElementById('analyze-now-btn');
    chatSection = document.getElementById('chat-section');
    aiIntro = document.getElementById('ai-intro');
    userChatInput = document.getElementById('user-chat-input');
    sendChatBtn = document.getElementById('send-chat-btn');
    backBtn = document.getElementById('back-btn');
    newChatBtn = document.getElementById('new-chat-btn');
    chatHistoryList = document.getElementById('chat-history-list');

    // Event listeners
    if (analyzeNowBtn) analyzeNowBtn.addEventListener('click', handleAnalyzeNow);
    if (sendChatBtn) sendChatBtn.addEventListener('click', handleSendMessage);
    if (userChatInput) {
        userChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    }
    if (backBtn) backBtn.addEventListener('click', handleBack);
    if (newChatBtn) newChatBtn.addEventListener('click', createNewChat);

    // Load chat history from localStorage
    loadChatHistory();
});

// Back button handler - navigates back using window.history.back()
function handleBack() {

    // Clear chat window
    chatMessages.innerHTML = "";

    // Reset conversation
    conversationHistory = [];
    currentChatId = null;

    // Show AI intro page again
    aiIntro.style.display = "flex";
    chatSection.style.display = "none";

}

// Get current language
function getCurrentLanguage() {
    return localStorage.getItem("selectedLanguage") || "en";
}

// Get language-specific system prompt
function getSystemPrompt(waterData) {
    const lang = getCurrentLanguage();
    const ph = waterData.ph || "N/A";
    const tds = waterData.tds || "N/A";
    const temp = waterData.temp || "N/A";

    const prompts = {
        en: `You are a Water Scientist. You are a helpful AI assistant specialized in water quality analysis. Data: pH:${ph}, TDS:${tds}ppm, Temperature:${temp}°C. Provide a verdict (SAFE/UNSAFE) and 3 practical tips for improvement. Always respond in English unless the user asks in another language.`,
        hi: `आप एक जल वैज्ञानिक हैं। आप जल गुणवत्ता विश्लेषण में विशेषज्ञ AI सहायक हैं। डेटा: pH:${ph}, TDS:${tds}ppm, तापमान:${temp}°C। एक निर्णय (सुरक्षित/असुरक्षित) और 3 व्यावहारिक सुझाव दें। हिंदी में उत्तर दें।`,
        mr: `आप एक पाण्याचे शास्त्रज्ञ आहात। आप पाण्याच्या गुणवत्ता विश्लेषणात विशेषज्ञ AI सहायक आहात. डेटा: pH:${ph}, TDS:${tds}ppm, तापमान:${temp}°C. एक निर्णय (सुरक्षित/असुरक्षित) आणि 3 व्यावहारिक टिप्स द्या. मराठीत उत्तर द्या.`
    };

    return prompts[lang] || prompts.en;
}

// Get user prompt in appropriate language
function getUserPrompt(isInitial) {
    const lang = getCurrentLanguage();

    if (isInitial) {
        const prompts = {
            en: "Analyze my water quality data.",
            hi: "मेरे पानी की गुणवत्ता डेटा का विश्लेषण करें।",
            mr: "माझ्या पाण्याच्या गुणवत्ता डेटाचे विश्लेषण करा."
        };
        return prompts[lang] || prompts.en;
    }
    return null;
}

// Save chats to localStorage
function saveChats() {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

// Load chat history from localStorage
function loadChatHistory() {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    renderChatHistory(chats);
}

// Render chat history in sidebar
function renderChatHistory(chats) {
    if (!chatHistoryList) return;
    
    chatHistoryList.innerHTML = "";
    
    // Sort by date descending (newest first)
    const sortedChats = [...chats].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedChats.forEach(chat => {
        const item = document.createElement('div');
        item.className = `chat-history-item ${chat.id === currentChatId ? 'active' : ''}`;
        item.innerHTML = `
            <div class="chat-history-title">${escapeHtml(chat.title)}</div>
            <div class="chat-history-date">${formatDate(chat.date)}</div>
        `;
        item.addEventListener('click', () => loadChat(chat.id));
        chatHistoryList.appendChild(item);
    });
}

// Create a new chat
function createNewChat() {
    // Save current chat if exists
    if (currentChatId && conversationHistory.length > 0) {
        saveCurrentChat();
    }

    // Generate new chat ID
    currentChatId = "chat_" + Date.now();
    conversationHistory = [];

    // Clear UI
    chatMessages.innerHTML = "";
    aiIntro.style.display = "flex";
    chatSection.style.display = "none";

    // Update history
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    renderChatHistory(chats);
}

// Load a specific chat
function loadChat(chatId) {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const chat = chats.find(c => c.id === chatId);
    
    if (!chat) return;

    // Save current chat if exists
    if (currentChatId && conversationHistory.length > 0) {
        saveCurrentChat();
    }

    currentChatId = chatId;
    conversationHistory = chat.messages || [];

    // Clear and display messages
    chatMessages.innerHTML = "";
    
    if (conversationHistory.length > 0) {
        aiIntro.style.display = "none";
        chatSection.style.display = "flex";
        
        conversationHistory.forEach(msg => {
            addMessageToChat(msg.content, msg.role);
        });
    } else {
        aiIntro.style.display = "flex";
        chatSection.style.display = "none";
    }

    // Update history UI
    renderChatHistory(chats);
}

// Save current chat to localStorage
function saveCurrentChat() {
    if (!currentChatId || conversationHistory.length === 0) return;

    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const existingIndex = chats.findIndex(c => c.id === currentChatId);
    
    // Get title from first user message
    let title = "New Chat";
    const firstUserMsg = conversationHistory.find(m => m.role === "user");
    if (firstUserMsg) {
        title = firstUserMsg.content.substring(0, 30);
        if (firstUserMsg.content.length > 30) title += "...";
    }

    const chatData = {
        id: currentChatId,
        title: title,
        messages: conversationHistory,
        
    };

    if (existingIndex >= 0) {
        chats[existingIndex] = chatData;
    } else {
        chats.push(chatData);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

// Save chat after AI response
function saveChatAfterResponse(aiResponse) {
    if (!currentChatId) {
        currentChatId = "chat_" + Date.now();
    }

    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const existingIndex = chats.findIndex(c => c.id === currentChatId);
    
    // Generate title from first user message
    let title = "Water Analysis";
    const firstUserMsg = conversationHistory.find(m => m.role === "user");
    if (firstUserMsg) {
        title = firstUserMsg.content.substring(0, 30);
        if (firstUserMsg.content.length > 30) title += "...";
    }

    const chatData = {
        id: currentChatId,
        title: title,
        messages: conversationHistory,
       date: new Date().toLocaleDateString()
    };

    if (existingIndex >= 0) {
        chats[existingIndex] = chatData;
    } else {
        chats.push(chatData);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    renderChatHistory(chats);
}

// Handle "Analyze Now" button
async function handleAnalyzeNow() {
    if (isProcessing) return;
    
    // Create new chat if none exists
    if (!currentChatId) {
        currentChatId = "chat_" + Date.now();
    }
    
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
        
        // Save chat
        saveChatAfterResponse(aiResponse);
        
    } catch (error) {
        console.error("AI Error:", error);
        removeLoadingMessage();
        const errorMsg = getCurrentLanguage() === 'mr' ? "⚠️ कनेक्शन त्रुटी। कृपया आपली इंटरनेट जोडणी तपासा आणि पुन्हा प्रयत्न करा." :
                       getCurrentLanguage() === 'hi' ? "⚠️ कनेक्शन त्रुटी। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।" :
                       "⚠️ Connection error. Please check your internet and try again.";
        addMessageToChat(errorMsg, 'ai');
    } finally {
        isProcessing = false;
    }
}

// Call Groq API with language support
async function callGroqAPI(userMessage, waterData, isInitial) {
    const messages = [];
    const systemPrompt = getSystemPrompt(waterData);
    
    messages.push({ role: "system", content: systemPrompt });
    
    if (isInitial) {
        const userPrompt = getUserPrompt(true);
        messages.push({ role: "user", content: userPrompt });
    } else {
        conversationHistory.forEach(msg => messages.push(msg));
        messages.push({ role: "user", content: userMessage });
    }
const controller = new AbortController();
const timeout = setTimeout(() => {
    controller.abort();
    console.log("Groq request timeout");
}, 20000);

//ADD API KEYS HERE//


const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

const response = await fetch(GROQ_API_URL, {
    method: "POST",
    mode: "cors",
    headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
    }),
    signal: controller.signal
});

clearTimeout(timeout);

const result = await response.json();

if (!response.ok) {
    console.error("Groq API Error:", result);
    throw new Error(result.error?.message || "Groq API failed");
}

if (!result.choices || !result.choices[0]) {
    console.error("Invalid AI response:", result);
    throw new Error("Invalid AI response");
}

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
        
        // Save chat after response
        saveChatAfterResponse(response);
    } catch (e) {
        removeLoadingMessage();
        const errorMsg = getCurrentLanguage() === 'mr' ? "⚠️ त्रुटी आली. पुन्हा प्रयत्न करा." :
                       getCurrentLanguage() === 'hi' ? "⚠️ त्रुटि आई। पुनः प्रयास करें।" :
                       "⚠️ Error occurred. Please try again.";
        addMessageToChat(errorMsg, 'ai');
    } finally {
        isProcessing = false;
    }
}

function showLoadingMessage() {
    const div = document.createElement('div');
    div.className = 'chat-message ai-message';
    div.id = 'loading-msg';
    const loadingText = getCurrentLanguage() === 'mr' ? 'विचार करत आहे...' :
                       getCurrentLanguage() === 'hi' ? 'सोच रहा है...' :
                       'Thinking...';
    div.innerHTML = `<div class="message-content">${loadingText}</div>`;
    chatMessages.appendChild(div);
}

function removeLoadingMessage() {
    const el = document.getElementById('loading-msg');
    if (el) el.remove();
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}


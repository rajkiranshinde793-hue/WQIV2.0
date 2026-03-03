/**
 * AI Water Quality Analysis - Groq API Integration
 * 
 * This JavaScript integrates with:
 * 1. Firebase Realtime Database v12 (modular) - for live sensor data
 * 2. Groq API - for AI-powered water quality analysis
 * 
 * Database Structure:
 * - /sensors/water-quality: Live sensor data
 */

// ==========================================
// 1. FIREBASE IMPORTS (v12 Modular)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// ==========================================
// 2. FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAH_qoGe9siWiQ_6OJYvRXWF_T-8Jg2P2U",
    authDomain: "wqiv1-7588d.firebaseapp.com",
    databaseURL: "https://wqiv1-7588d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wqiv1-7588d",
    storageBucket: "wqiv1-7588d.firebasestorage.app",
    messagingSenderId: "1045198749186",
    appId: "1:1045198749186:web:52657bc9ca7ce4aa36311b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ==========================================
// 3. GROQ API CONFIGURATION
// ==========================================
/**
 * WARNING: This API key is exposed in frontend code.
 * For production, use a backend server to proxy API requests.
 * This is for development/demo purposes only.
 */



// ==========================================
// 4. SAFETY THRESHOLDS
// ==========================================
const thresholds = {
    ph: { min: 6.5, max: 8.5 },
    tds: { max: 500 },
    turbidity: { max: 1 },
    ec: { max: 2.5 },
    temp: { min: 15, max: 30 },
    hardness: { max: 120 },
    chlorides: { max: 250 },
    tss: { max: 30 },
    salinity: { max: 1000 },
    metals: { max: 0.01 }
};

// Parameter display names and units
const paramNames = {
    ph: 'pH',
    tds: 'TDS',
    turbidity: 'Turbidity',
    ec: 'EC',
    temp: 'Temperature',
    hardness: 'Hardness',
    chlorides: 'Chlorides',
    tss: 'TSS',
    salinity: 'Salinity',
    metals: 'Heavy Metals'
};

const paramUnits = {
    ph: '',
    tds: 'ppm',
    turbidity: 'NTU',
    ec: 'S/M',
    temp: '°C',
    hardness: 'N/mm²',
    chlorides: 'Mmol/L',
    tss: 'ppm',
    salinity: 'ppm',
    metals: 'g/cm³'
};

// ==========================================
// 5. CONVERSATION STATE
// ==========================================
let conversationHistory = [];
let isProcessing = false;

// ==========================================
// 6. DOM ELEMENTS
// ==========================================
const chatMessages = document.getElementById('chat-messages');
const analyzeNowBtn = document.getElementById('analyze-now-btn');
const chatInputArea = document.getElementById('chat-input-area');
const userChatInput = document.getElementById('user-chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');

// ==========================================
// 7. FIREBASE DATA FETCHING
// ==========================================

/**
 * Fetch current water quality data from Firebase
 * @returns {Promise<object|null>} - Water quality data or null if error
 */
async function fetchWaterQualityData() {
    try {
        const dataRef = ref(database, 'sensors/water-quality');
        const snapshot = await get(dataRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.error("No data available at /sensors/water-quality");
            return null;
        }
    } catch (error) {
        console.error("Error fetching water quality data:", error);
        return null;
    }
}

// ==========================================
// 8. GROQ API FUNCTIONS
// ==========================================

/**
 * Build the system prompt with current data and thresholds
 * @param {object} data - Water quality sensor data
 * @returns {string} - Complete system prompt
 */
function buildSystemPrompt(data) {
    // Format the data for the prompt
    let dataStr = "CURRENT WATER QUALITY DATA:\n";
    dataStr += "─────────────────────────\n";
    
    const params = ['ph', 'tds', 'turbidity', 'ec', 'temp', 'hardness', 'chlorides', 'tss', 'salinity', 'metals'];
    
    params.forEach(param => {
        const value = data[param] !== undefined ? data[param] : 'N/A';
        const unit = paramUnits[param];
        const name = paramNames[param];
        dataStr += `${name}: ${value} ${unit}\n`;
    });
    
    dataStr += "\nSAFETY THRESHOLDS (International Standards):\n";
    dataStr += "─────────────────────────────────────────\n";
    dataStr += `pH: ${thresholds.ph.min} - ${thresholds.ph.max}\n`;
    dataStr += `TDS: max ${thresholds.tds.max} ppm\n`;
    dataStr += `Turbidity: max ${thresholds.turbidity.max} NTU\n`;
    dataStr += `EC: max ${thresholds.ec.max} S/M\n`;
    dataStr += `Temperature: ${thresholds.temp.min} - ${thresholds.temp.max} °C\n`;
    dataStr += `Hardness: max ${thresholds.hardness.max} N/mm²\n`;
    dataStr += `Chlorides: max ${thresholds.chlorides.max} Mmol/L\n`;
    dataStr += `TSS: max ${thresholds.tss.max} ppm\n`;
    dataStr += `Salinity: max ${thresholds.salinity.max} ppm\n`;
    dataStr += `Heavy Metals: max ${thresholds.metals.max} g/cm³\n`;
    
    return dataStr;
}

/**
 * Call Groq API to get AI analysis
 * @param {string} userMessage - User's message/prompt
 * @param {object} waterData - Current water quality data
 * @param {boolean} isInitialAnalysis - Whether this is the initial analysis
 * @returns {Promise<string>} - AI response
 */
async function callGroqAPI(userMessage, waterData, isInitialAnalysis = false) {
    // Build messages for the API
    const messages = [];
    
    if (isInitialAnalysis) {
        // Initial analysis - build comprehensive system prompt
        const systemPrompt = `You are a senior water quality scientist with expertise in international water safety standards (WHO, EPA, BIS). 

${buildSystemPrompt(waterData)}

INSTRUCTIONS:
1. Analyze the data strictly based on international standards.
2. Provide a clear verdict: SAFE ✓, WARNING ⚠, or UNSAFE ✗
3. Explain which parameters are problematic and why (compare against thresholds).
4. Give exactly THREE actionable steps to improve water quality if needed.
5. Keep your response concise but informative.
6. Use bullet points for clarity.
7. Format your verdict prominently at the beginning.

Respond in a clear, structured format.`;
        
        messages.push({ role: "system", content: systemPrompt });
        messages.push({ role: "user", content: "Please analyze this water quality data and provide your expert assessment with recommendations." });
    } else {
        // Follow-up chat - include conversation history
        const systemPrompt = `You are a senior water quality scientist with expertise in international water safety standards (WHO, EPA, BIS). 

${buildSystemPrompt(waterData)}

INSTRUCTIONS:
1. Answer the user's follow-up questions about this water quality data.
2. Refer to the data provided above in your responses.
3. Keep answers concise and actionable.
4. If the user asks about specific parameters, compare against the thresholds provided.
5. Provide practical advice for improving water quality when asked.`;
        
        messages.push({ role: "system", content: systemPrompt });
        
        // Add conversation history
        conversationHistory.forEach(msg => {
            messages.push(msg);
        });
        
        // Add current user message
        messages.push({ role: "user", content: userMessage });
    }
    
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error("Groq API Error:", error);
        throw error;
    }
}

// ==========================================
// 9. UI FUNCTIONS
// ==========================================

/**
 * Add a message to the chat window
 * @param {string} content - Message content
 * @param {string} type - 'user' or 'ai'
 */
function addMessageToChat(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = type === 'user' ? '👤' : '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Format message content (convert markdown-like syntax)
 * @param {string} content - Raw message content
 * @returns {string} - Formatted HTML
 */
function formatMessage(content) {
    // Basic formatting
    let formatted = content
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Format verdict if present
    if (formatted.includes('SAFE') || formatted.includes('WARNING') || formatted.includes('UNSAFE')) {
        formatted = formatted
            .replace(/(SAFE ✓)/gi, '<span class="verdict-safe">$1</span>')
            .replace(/(WARNING ⚠)/gi, '<span class="verdict-warning">$1</span>')
            .replace(/(UNSAFE ✗)/gi, '<span class="verdict-unsafe">$1</span>');
    }
    
    return formatted;
}

/**
 * Show loading animation in chat
 */
function showLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message ai-message loading-message';
    loadingDiv.id = 'loading-message';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <span class="loading-text">Analyzing water quality...</span>
    `;
    
    loadingDiv.appendChild(avatarDiv);
    loadingDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Remove loading message from chat
 */
function removeLoadingMessage() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

/**
 * Show error message in chat
 * @param {string} error - Error message
 */
function showErrorMessage(error) {
    addMessageToChat(`⚠️ Error: ${error}. Please try again.`, 'ai');
}

/**
 * Toggle chat input area visibility
 * @param {boolean} show - Whether to show the input area
 */
function toggleChatInput(show) {
    if (show) {
        chatInputArea.style.display = 'flex';
        userChatInput.focus();
    } else {
        chatInputArea.style.display = 'none';
    }
}

/**
 * Toggle analyze now button visibility
 * @param {boolean} show - Whether to show the button
 */
function toggleAnalyzeButton(show) {
    if (show) {
        analyzeNowBtn.style.display = 'inline-block';
    } else {
        analyzeNowBtn.style.display = 'none';
    }
}

// ==========================================
// 10. EVENT HANDLERS
// ==========================================

/**
 * Handle Analyze Now button click
 */
async function handleAnalyzeNow() {
    if (isProcessing) return;
    
    isProcessing = true;
    analyzeNowBtn.disabled = true;
    analyzeNowBtn.textContent = 'Analyzing...';
    
    // Show loading message
    addMessageToChat('Fetching latest water quality data from sensors...', 'ai');
    showLoadingMessage();
    
    try {
        // Fetch current water quality data
        const waterData = await fetchWaterQualityData();
        
        if (!waterData) {
            removeLoadingMessage();
            showErrorMessage("Could not fetch water quality data. Please check your Firebase connection.");
            isProcessing = false;
            analyzeNowBtn.disabled = false;
            analyzeNowBtn.textContent = 'Analyze Now';
            return;
        }
        
        // Remove loading and show data fetched message
        removeLoadingMessage();
        addMessageToChat('Data received! Sending to AI for analysis...', 'ai');
        showLoadingMessage();
        
        // Call Groq API for initial analysis
        const aiResponse = await callGroqAPI(null, waterData, true);
        
        // Remove loading and display AI response
        removeLoadingMessage();
        addMessageToChat(aiResponse, 'ai');
        
        // Add AI response to conversation history
        conversationHistory.push({ role: "assistant", content: aiResponse });
        
        // Update UI
        toggleAnalyzeButton(false);
        toggleChatInput(true);
        
    } catch (error) {
        console.error("Analysis Error:", error);
        removeLoadingMessage();
        showErrorMessage(error.message || "Failed to analyze water quality");
    } finally {
        isProcessing = false;
        analyzeNowBtn.disabled = false;
        analyzeNowBtn.textContent = 'Analyze Now';
    }
}

/**
 * Handle send chat button click
 */
async function handleSendMessage() {
    const userMessage = userChatInput.value.trim();
    
    if (!userMessage || isProcessing) return;
    
    // Clear input
    userChatInput.value = '';
    
    // Add user message to chat
    addMessageToChat(userMessage, 'user');
    
    // Add to conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    
    // Show loading
    isProcessing = true;
    sendChatBtn.disabled = true;
    showLoadingMessage();
    
    try {
        // Fetch current water quality data for context
        const waterData = await fetchWaterQualityData();
        
        if (!waterData) {
            removeLoadingMessage();
            showErrorMessage("Could not fetch current water quality data");
            isProcessing = false;
            sendChatBtn.disabled = false;
            return;
        }
        
        // Call Groq API
        const aiResponse = await callGroqAPI(userMessage, waterData, false);
        
        // Remove loading and display AI response
        removeLoadingMessage();
        addMessageToChat(aiResponse, 'ai');
        
        // Add AI response to conversation history
        conversationHistory.push({ role: "assistant", content: aiResponse });
        
    } catch (error) {
        console.error("Chat Error:", error);
        removeLoadingMessage();
        showErrorMessage(error.message || "Failed to get response");
    } finally {
        isProcessing = false;
        sendChatBtn.disabled = false;
    }
}

/**
 * Handle Enter key in chat input
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
}

// ==========================================
// 11. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if required DOM elements exist
    if (!chatMessages || !analyzeNowBtn || !chatInputArea || !userChatInput || !sendChatBtn) {
        console.error("Required DOM elements not found. Please check ai.html.");
        return;
    }
    
    // Set up event listeners
    analyzeNowBtn.addEventListener('click', handleAnalyzeNow);
    sendChatBtn.addEventListener('click', handleSendMessage);
    userChatInput.addEventListener('keypress', handleKeyPress);
    
    // Initialize UI state
    toggleChatInput(false);
    
    console.log("AI Water Quality Analysis initialized. Click 'Analyze Now' to begin.");
});

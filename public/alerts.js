/**
 * Water Quality Alerts - Firebase Realtime Database Integration
 * 
 * This JavaScript code integrates with Firebase Realtime Database v12 (modular approach)
 * to display live alerts and historical alert data.
 * 
 * Database Structure:
 * - /sensors/water-quality: Live data updated constantly
 * - /sensor_history: Historical data pushed chronologically with unique Firebase keys
 */

// ==========================================
// 1. FIREBASE IMPORTS (v12 Modular)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, onValue, query, orderByKey, limitToLast } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

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
// 3. SAFETY THRESHOLDS
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
    tds: 'PPM',
    turbidity: 'NTU',
    ec: 'S/M',
    temp: '°C',
    hardness: 'N/mm²',
    chlorides: 'Mmol/L',
    tss: 'PPM',
    salinity: 'PPM',
    metals: 'g/cm³'
};

// ==========================================
// 4. THRESHOLD ANALYSIS FUNCTIONS
// ==========================================

/**
 * Analyze a parameter against its threshold
 * @param {string} param - Parameter name
 * @param {number} value - Parameter value
 * @returns {object} - { status: 'good'|'warning'|'danger', message: string }
 */
function analyzeParameter(param, value) {
    const val = parseFloat(value);
    const threshold = thresholds[param];
    
    if (!threshold || isNaN(val)) {
        return { status: 'good', message: null };
    }
    
    switch (param) {
        case 'ph':
            if (val < threshold.min) {
                return { status: 'danger', message: `Low pH Detected (${val})` };
            } else if (val > threshold.max) {
                return { status: 'danger', message: `High pH Detected (${val})` };
            }
            return { status: 'good', message: null };
            
        case 'tds':
        case 'tss':
        case 'chlorides':
        case 'salinity':
            if (val > threshold.max) {
                return { status: 'danger', message: `High ${paramNames[param]} Detected (${val} ${paramUnits[param]})` };
            }
            return { status: 'good', message: null };
            
        case 'turbidity':
            if (val > threshold.max) {
                return { status: 'danger', message: `High Turbidity: ${val} NTU` };
            } else if (val > 0.5) {
                return { status: 'warning', message: `Elevated Turbidity: ${val} NTU` };
            }
            return { status: 'good', message: null };
            
        case 'ec':
            if (val > threshold.max) {
                return { status: 'warning', message: `High EC: ${val} S/M` };
            }
            return { status: 'good', message: null };
            
        case 'temp':
            if (val < threshold.min) {
                return { status: 'warning', message: `Low Temperature: ${val} °C` };
            } else if (val > threshold.max) {
                return { status: 'warning', message: `High Temperature: ${val} °C` };
            }
            return { status: 'good', message: null };
            
        case 'hardness':
            if (val > threshold.max) {
                return { status: 'warning', message: `High Hardness: ${val} N/mm²` };
            }
            return { status: 'good', message: null };
            
        case 'metals':
            if (val > threshold.max) {
                return { status: 'danger', message: `High Heavy Metals: ${val} g/cm³` };
            } else if (val > 0.005) {
                return { status: 'warning', message: `Elevated Heavy Metals: ${val} g/cm³` };
            }
            return { status: 'good', message: null };
            
        default:
            return { status: 'good', message: null };
    }
}

/**
 * Check all parameters and find the most critical alert
 * @param {object} data - Sensor data object
 * @returns {object} - { activeAlert: string|null, risk: string }
 */
function checkAllParameters(data) {
    let mostCritical = null;
    let highestRisk = 0; // 0 = good, 1 = warning, 2 = danger
    
    const params = ['ph', 'tds', 'turbidity', 'ec', 'temp', 'hardness', 'chlorides', 'tss', 'salinity', 'metals'];
    
    params.forEach(param => {
        if (data[param] !== undefined && data[param] !== null) {
            const result = analyzeParameter(param, data[param]);
            if (result.status === 'danger' && highestRisk < 2) {
                mostCritical = result.message;
                highestRisk = 2;
            } else if (result.status === 'warning' && highestRisk < 1) {
                mostCritical = result.message;
                highestRisk = 1;
            }
        }
    });
    
    const risk = highestRisk === 2 ? 'High' : (highestRisk === 1 ? 'Warning' : 'Normal');
    return { activeAlert: mostCritical, risk };
}

/**
 * Check a single reading for any threshold violations
 * @param {object} data - Sensor data object
 * @returns {array} - Array of alert objects
 */
function checkForAlerts(data) {
    const alerts = [];
    const params = ['ph', 'tds', 'turbidity', 'ec', 'temp', 'hardness', 'chlorides', 'tss', 'salinity', 'metals'];
    
    params.forEach(param => {
        if (data[param] !== undefined && data[param] !== null) {
            const result = analyzeParameter(param, data[param]);
            if (result.status !== 'good') {
                alerts.push({
                    param: param,
                    value: data[param],
                    status: result.status,
                    message: result.message
                });
            }
        }
    });
    
    return alerts;
}

// ==========================================
// 5. DATE/TIME FORMATTING
// ==========================================

/**
 * Format timestamp to DD/MM/YYYY
 * @param {number} timestamp - Unix timestamp in seconds or milliseconds
 * @returns {string} - Formatted date
 */
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    // Handle both seconds and milliseconds
    const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
    const date = new Date(ms);
    
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

/**
 * Format timestamp to HH:MM
 * @param {number} timestamp - Unix timestamp in seconds or milliseconds
 * @returns {string} - Formatted time
 */
function formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    
    // Handle both seconds and milliseconds
    const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
    const date = new Date(ms);
    
    if (isNaN(date.getTime())) return 'N/A';
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

// ==========================================
// 6. UI UPDATE FUNCTIONS
// ==========================================

/**
 * Update the main alert banner
 * @param {string|null} activeAlert - Alert message or null
 * @param {string} risk - Risk level ('High', 'Warning', 'Normal')
 */
function updateMainBanner(activeAlert, risk) {
    const mainAlertDisplay = document.getElementById("main-alert-display");
    
    if (activeAlert) {
        mainAlertDisplay.innerText = `{{${activeAlert}}}`;
        mainAlertDisplay.className = "main-alert-text text-danger";
    } else {
        mainAlertDisplay.innerText = "System Normal";
        mainAlertDisplay.className = "main-alert-text text-safe";
    }
}

/**
 * Update the alerts table with historical data
 * @param {array} alertHistory - Array of alert objects
 */
function updateAlertsTable(alertHistory) {
    const tbody = document.getElementById("alerts-tbody");
    tbody.innerHTML = ""; // Clear existing rows
    
    // Reverse to show newest first
    const reversedAlerts = [...alertHistory].reverse();
    
    let rowCount = 1;
    
    reversedAlerts.forEach(alert => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${rowCount}</td>
            <td>${alert.date}</td>
            <td>${alert.time}</td>
            <td>${alert.type}</td>
            <td>${alert.message}</td>
            <td>${alert.risk}</td>
        `;
        tbody.appendChild(tr);
        rowCount++;
    });

    // Add empty rows to maintain table structure (optional)
    const emptyRowsNeeded = Math.max(0, 4 - alertHistory.length);
    for (let i = 0; i < emptyRowsNeeded; i++) {
        const emptyTr = document.createElement("tr");
        emptyTr.innerHTML = `
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
        `;
        tbody.appendChild(emptyTr);
    }
}

// ==========================================
// 7. FIREBASE DATA LISTENERS
// ==========================================

/**
 * Listen to live sensor data for the main banner
 */
function listenToLiveData() {
    const liveRef = ref(database, 'sensors/water-quality');
    
    onValue(liveRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const result = checkAllParameters(data);
            updateMainBanner(result.activeAlert, result.risk);
        }
    }, (error) => {
        console.error("Error fetching live data:", error);
    });
}

/**
 * Fetch historical sensor data and generate alerts & maintenance logs
 */
function fetchHistoricalAlerts() {
    const historyRef = ref(database, 'sensor_history');
    const historyQuery = query(historyRef, orderByKey(), limitToLast(50));
    
    onValue(historyQuery, (snapshot) => {
        const data = snapshot.val();
        const alertHistory = [];
        
        if (data) {
            snapshot.forEach((childSnapshot) => {
                const reading = childSnapshot.val();
                const timestamp = reading.timestamp || childSnapshot.key;
                
                // --- NEW: Check if this is a Calibration Log ---
                if (reading.is_calibration) {
                    alertHistory.push({
                        date: formatDate(timestamp),
                        time: formatTime(timestamp),
                        type: '🛠️ Maintenance',
                        message: reading.cal_message,
                        risk: 'Info'
                    });
                } 
                // --- Normal Sensor Reading Check ---
                else {
                    const violations = checkForAlerts(reading);
                    if (violations.length > 0) {
                        const criticalViolation = violations.find(v => v.status === 'danger') || violations[0];
                        const risk = criticalViolation.status === 'danger' ? 'High' : 'Warning';
                        
                        alertHistory.push({
                            date: formatDate(timestamp),
                            time: formatTime(timestamp),
                            type: 'Water Quality',
                            message: criticalViolation.message,
                            risk: risk
                        });
                    }
                }
            });
        }
        
        // Update table with alert history
        updateAlertsTable(alertHistory);
        
    }, (error) => {
        console.error("Error fetching historical data:", error);
    });
}

// ==========================================
// 8. INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Start fetching the live banner data
    listenToLiveData();
    
    // 2. Start fetching the historical logs for the table
    fetchHistoricalAlerts();

    // 3. Setup the report button
    const reportBtn = document.getElementById("btn-open-report-page");
    if (reportBtn) {
        reportBtn.addEventListener("click", () => {
            window.location.href = "report.html";
        });
    }
});

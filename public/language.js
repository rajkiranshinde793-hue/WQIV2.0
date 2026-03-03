/**
 * Global Multi-Language System for Water Quality Monitoring
 * Supports: English, Hindi (हिन्दी), Marathi (मराठी)
 * Uses localStorage for persistence
 */

// Translation Object
const translations = {
    en: {
        // Navigation
        "about_us": "About Us",
        "live_dashboard": "Live Dashboard",
        "select_mode": "Select Mode",
        "calibrations": "Calibrations",
        "alerts": "Alerts",
        "ai": "AI",
        "login": "Login",
        
        // Dashboard
        "water_quality": "Water Quality",
        "ph": "pH",
        "tds": "TDS",
        "turbidity": "Turbidity",
        "ec": "EC",
        "temp": "TEMP",
        "hardness": "Hardness",
        "chlorides": "Chlorides",
        "tss": "TSS",
        "salinity": "Salinity",
        "heavy_metals": "Heavy Metals",
        "mode_checking": "Mode: Checking...",
        "take_reading": "Take Reading",
        "custom_graph": "Custom Graph",
        "trend_analytics": "Trend Analytics",
        "parameter_vs_time": "Parameter vs Time",
        "x_axis": "X-Axis (Parameter 1)",
        "y_axis": "Y-Axis (Parameter 2)",
        "plot_graph": "Plot Graph",
        "dashboard_note": "Disclaimer: The values for hardness, salinity, and Total Suspended Solids (TSS) are estimated using IoT sensor data and algorithmic calculations. These readings are intended for real-time monitoring and indicative purposes only and may not match certified laboratory test results. For regulatory, medical, or critical decision-making, please verify water quality through an accredited laboratory.",
        
        // Alerts
        "water_quality_alerts": "WATER QUALITY ALERTS",
        "download_report": "Download Report",
        "sr_no": "Sr. No",
        "date": "Date",
        "time": "Time",
        "alert_type": "Alert Type",
        "alert": "Alert",
        "risk": "Risk",
        "system_checking": "System Checking...",
        
        // Report
        "generate_water_quality_report": "GENERATE WATER QUALITY REPORT",
        "current_reading_report": "Current Reading Report",
        "generate_current_report": "Generate Current Report",
        "date_range_report": "Date Range Report",
        "generate_custom_report": "Generate Custom Report",
        
        // Home Page
        "JAL_NETRA": "JAL NETRA",
        "tag_line": "Eyes on Every Drop",

        // Footer
        "privacy_policy": "Privacy Policy",
        "raj_shinde": "Raj Shinde:",
        "copyright": "© 2025 Water Quality Monitoring. All rights reserved.",
        
        // Status
        "good": "Good",
        "bad": "Bad",
        "drinkable": "Drinkable",
        "not_drinkable": "Not Drinkable",
        
        // Graph Labels
        "ph_vs_temperature": "pH vs Temperature",
        "tds_vs_electrical_conductivity": "TDS vs Electrical Conductivity (EC)",
        "turbidity_vs_tss": "Turbidity vs Total Suspended Solids (TSS)",
        "hardness_vs_chlorides": "Hardness vs Chlorides",
        "salinity_vs_heavy_metals": "Salinity vs Heavy Metals"
    },
    hi: {
        // Navigation
        "about_us": "हमारे बारे में",
        "live_dashboard": "लाइव डैशबोर्ड",
        "select_mode": "मोड चुनें",
        "calibrations": "अंशांकन",
        "alerts": "अलर्ट",
        "ai": "AI",
        "login": "लॉगिन",
        
        // Dashboard
        "water_quality": "पानी की गुणवत्ता",
        "ph": "pH",
        "tds": "TDS",
        "turbidity": "स्पष्टता",
        "ec": "EC",
        "temp": "तापमान",
        "hardness": "कठोरता",
        "chlorides": "क्लोराइड",
        "tss": "TSS",
        "salinity": "लवणता",
        "heavy_metals": "भारी धातु",
        "mode_checking": "मोड: जांच हो रही है...",
        "take_reading": "रीडिंग लें",
        "custom_graph": "कस्टम ग्राफ",
        "trend_analytics": "ट्रेंड एनालिटिक्स",
        "parameter_vs_time": "पैरामीटर बनाम समय",
        "x_axis": "X-अक्ष (पैरामीटर 1)",
        "y_axis": "Y-अक्ष (पैरामीटर 2)",
        "plot_graph": "ग्राफ बनाएं",
        "dashboard_note": "डिस्क्लेमर: हार्डनेस, सैलिनिटी और टोटल सस्पेंडेड सॉलिड्स (TSS) की वैल्यू का अनुमान IoT सेंसर डेटा और एल्गोरिदमिक कैलकुलेशन का इस्तेमाल करके लगाया जाता है। ये रीडिंग सिर्फ़ रियल-टाइम मॉनिटरिंग और इंडिकेटिव मकसद के लिए हैं और सर्टिफाइड लैबोरेटरी टेस्ट के नतीजों से मैच नहीं कर सकती हैं। रेगुलेटरी, मेडिकल या ज़रूरी फैसले लेने के लिए, कृपया किसी एक्रेडिटेड लैबोरेटरी से पानी की क्वालिटी वेरिफाई करें।",
        
        // Alerts
        "water_quality_alerts": "पानी की गुणवत्ता अलर्ट",
        "download_report": "रिपोर्ट डाउनलोड करें",
        "sr_no": "क्र.सं.",
        "date": "तारीख",
        "time": "समय",
        "alert_type": "अलर्ट प्रकार",
        "alert": "अलर्ट",
        "risk": "जोखिम",
        "system_checking": "सिस्टम जांच हो रहा है...",
        
        // Report
        "generate_water_quality_report": "पानी की गुणवत्ता रिपोर्ट बनाएं",
        "current_reading_report": "वर्तमान रीडिंग रिपोर्ट",
        "generate_current_report": "वर्तमान रिपोर्ट बनाएं",
        "date_range_report": "तारीख सीमा रिपोर्ट",
        "generate_custom_report": "कस्टम रिपोर्ट बनाएं",
        
        // Home Page
        "JAL_NETRA": "जल नेत्र",
        "tag_line": "हर बूंद पर हमारी नज़र",

        
        // Footer
        "privacy_policy": "गोपनीयता नीति",
        "raj_shinde": "राज शिंदे:",
        "copyright": "© 2025 पानी की गुणवत्ता निगरानी। सर्वाधिकार सुरक्षित।",
        
        // Status
        "good": "अच्छा",
        "bad": "खराब",
        "drinkable": "पीने योग्य",
        "not_drinkable": "पीने योग्य नहीं",
        
        // Graph Labels
        "ph_vs_temperature": "pH बनाम तापमान",
        "tds_vs_electrical_conductivity": "TDS बनाम विद्युत चालकता (EC)",
        "turbidity_vs_tss": "स्पष्टता बनाम कुल निलंबित ठोस (TSS)",
        "hardness_vs_chlorides": "कठोरता बनाम क्लोराइड",
        "salinity_vs_heavy_metals": "लवणता बनाम भारी धातु"
    },
    mr: {
        // Navigation
        "about_us": "आमच्याबद्दल",
        "live_dashboard": "लाइव डॅशबोर्ड",
        "select_mode": "मोड निवडा",
        "calibrations": "कॅलिब्रेशन",
        "alerts": "अलर्ट",
        "ai": "AI",
        "login": "लॉगिन",
        
        // Dashboard
        "water_quality": "पाण्याची गुणवत्ता",
        "ph": "pH",
        "tds": "TDS",
        "turbidity": "स्पष्टता",
        "ec": "EC",
        "temp": "तापमान",
        "hardness": "कठोरता",
        "chlorides": "क्लोराइड",
        "tss": "TSS",
        "salinity": "खारटपणा",
        "heavy_metals": "जड धातू",
        "mode_checking": "मोड: तपासणी सुरू...",
        "take_reading": "रीडिंग घ्या",
        "custom_graph": "कस्टम ग्राफ",
        "trend_analytics": "ट्रेंड विश्लेषण",
        "parameter_vs_time": "पैरामीटर विरुद्ध वेळ",
        "x_axis": "X-अक्ष (पैरामीटर 1)",
        "y_axis": "Y-अक्ष (पैरामीटर 2)",
        "plot_graph": "ग्राफ काढा",
        "dashboard_note": "अस्वीकरण: कडकपणा, खारटपणा आणि एकूण निलंबित घन पदार्थ (TSS) साठी मूल्ये IoT सेन्सर डेटा आणि अल्गोरिथमिक गणना वापरून अंदाजित केली जातात. हे वाचन केवळ रिअल-टाइम देखरेख आणि सूचक हेतूंसाठी आहेत आणि प्रमाणित प्रयोगशाळा चाचणी निकालांशी जुळत नाहीत. नियामक, वैद्यकीय किंवा गंभीर निर्णय घेण्यासाठी, कृपया मान्यताप्राप्त प्रयोगशाळेद्वारे पाण्याची गुणवत्ता सत्यापित करा.",
        
        // Alerts
        "water_quality_alerts": "पाण्याची गुणवत्ता अलर्ट",
        "download_report": "रिपोर्ट डाऊनलोड करा",
        "sr_no": "अ.क्र.",
        "date": "तारीख",
        "time": "वेळ",
        "alert_type": "अलर्ट प्रकार",
        "alert": "अलर्ट",
        "risk": "धोका",
        "system_checking": "सिस्टम तपासत आहे...",
        
        // Report
        "generate_water_quality_report": "पाण्याची गुणवत्ता रिपोर्ट तयार करा",
        "current_reading_report": "वर्तमान रीडिंग रिपोर्ट",
        "generate_current_report": "वर्तमान रिपोर्ट तयार करा",
        "date_range_report": "तारीख श्रेणी रिपोर्ट",
        "generate_custom_report": "कस्टम रिपोर्ट तयार करा",
        
        // Home Page
        "JAL_NETRA": "जल नेत्र",
        "tag_line": "हर बूंद पर हमारी नज़र",
        
        // Footer
        "privacy_policy": "गोपनीयता धोरण",
        "raj_shinde": "राज शिंदे:",
        "copyright": "© 2025 पाण्याची गुणवत्ता निरीक्षण. सर्व rights राखीव.",
        
        // Status
        "good": "चांगले",
        "bad": "वाईट",
        "drinkable": "पिण्यायोग्य",
        "not_drinkable": "पिण्यायोग्य नाही",
        
        // Graph Labels
        "ph_vs_temperature": "pH विरुद्ध तापमान",
        "tds_vs_electrical_conductivity": "TDS विरुद्ध विद्युत चालकता (EC)",
        "turbidity_vs_tss": "स्पष्टता विरुद्ध एकूण लांब ठोस (TSS)",
        "hardness_vs_chlorides": "कठोरता विरुद्ध क्लोराइड",
        "salinity_vs_heavy_metals": "खारटपणा विरुद्ध जड धातू"
    }
};

// Current language (default: English)
let currentLanguage = "en";

/**
 * Get translation for a given key
 * @param {string} key - Translation key
 * @returns {string} - Translated text or key if not found
 */
function t(key) {
    return translations[currentLanguage][key] || key;
}

/**
 * Apply translations to all elements with data-translate attribute
 */
function applyTranslations() {
    const elements = document.querySelectorAll("[data-translate]");
    elements.forEach(element => {
        const key = element.getAttribute("data-translate");
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Update document lang attribute
    document.documentElement.lang = currentLanguage;
}

/**
 * Change language and save to localStorage
 * @param {string} lang - Language code (en, hi, mr)
 */
function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem("selectedLanguage", lang);
        applyTranslations();
        
        // Update all language dropdowns if they exist
        const languageSelects = document.querySelectorAll("#language-select, .language-select");
        languageSelects.forEach(select => {
            if (select) select.value = lang;
        });
    }
}

/**
 * Initialize language system on page load
 */
function initLanguage() {
    // Check localStorage for saved language
    const savedLanguage = localStorage.getItem("selectedLanguage");
    
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    } else {
        // Default to English
        currentLanguage = "en";
        localStorage.setItem("selectedLanguage", "en");
    }
    
    // Apply translations
    applyTranslations();
    
    // Set up language dropdown event listeners
    const languageSelects = document.querySelectorAll("#language-select, .language-select");
    languageSelects.forEach(select => {
        if (select) {
            select.value = currentLanguage;
            select.addEventListener("change", (e) => {
                changeLanguage(e.target.value);
            });
        }
    });
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initLanguage);

// Export functions for global use
window.changeLanguage = changeLanguage;
window.applyTranslations = applyTranslations;
window.t = t;

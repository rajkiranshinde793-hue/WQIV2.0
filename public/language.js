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
        
        // AI Page
        "back": "Back",
        "new_chat": "New Chat",
        
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
        "salinity_vs_heavy_metals": "Salinity vs Heavy Metals",


        // Calibration Page
         "alerts_title": "Alerts",
         "checking_status": "Checking Status...",
         "calibration_wizard": "Calibration Wizard",
         "hardware_cloud": "Hardware & Cloud Settings",
         "battery_diag": "Battery Diagnostics",
         "twilio_settings": "Twilio SMS Settings",
         "target_phone": "Target Phone No",
         "danger_interval": "Danger Interval (hr)",
         "safe_interval": "Safe Interval (hr)",

         "about_text_1": "We are developing a low-cost IoT-based Water Quality Monitoring System that provides real-time analysis of key water parameters. Our platform combines smart sensors, cloud connectivity, and AI assistance to deliver instant alerts, intelligent insights, and automated PDF reports. The goal is to enable early detection of contamination and support safe water access, especially in rural and underserved communities.",
         "about_text_2": "The system continuously monitors important indicators such as pH, turbidity, temperature, TDS, and salinity, allowing users to track water quality anytime and from anywhere through a user-friendly web dashboard. Whenever any parameter crosses safe limits, the system immediately notifies users, enabling quick preventive action. Designed to be portable, affordable, and easy to deploy, our solution bridges the gap between traditional laboratory testing and the need for continuous on-field monitoring while promoting smarter water management and healthier communities."
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
        
        // AI Page
        "back": "वापस",
        "new_chat": "नई चैट",
        
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
        "salinity_vs_heavy_metals": "लवणता बनाम भारी धातु",



        // Calibration Page
         "alerts_title": "अलर्ट",
         "checking_status": "स्थिति जांची जा रही है...",
         "calibration_wizard": "कैलिब्रेशन विज़ार्ड", 
         "hardware_cloud": "हार्डवेयर और क्लाउड सेटिंग्स",
         "battery_diag": "बैटरी डायग्नोस्टिक्स",
         "twilio_settings": "ट्विलियो एसएमएस सेटिंग्स",
         "target_phone": "लक्ष्य फोन नंबर",
         "danger_interval": "खतरे का अंतर (घंटे)",
         "safe_interval": "सुरक्षित अंतर (घंटे)",


         "about_text_1": "हम एक कम लागत वाला IoT-बेस्ड वॉटर क्वालिटी मॉनिटरिंग सिस्टम बना रहे हैं जो पानी के ज़रूरी पैरामीटर्स का रियल-टाइम एनालिसिस देता है। हमारा प्लेटफ़ॉर्म स्मार्ट सेंसर, क्लाउड कनेक्टिविटी और AI असिस्टेंस को मिलाकर तुरंत अलर्ट, इंटेलिजेंट इनसाइट्स और ऑटोमेटेड PDF रिपोर्ट देता है। इसका मकसद कंटैमिनेशन का जल्दी पता लगाना और खास तौर पर ग्रामीण और कम सुविधाओं वाले समुदायों में सुरक्षित पानी तक पहुंच को सपोर्ट करना है।",
         "about_text_2": "यह सिस्टम pH, टर्बिडिटी, टेम्परेचर, TDS और सैलिनिटी जैसे ज़रूरी इंडिकेटर्स को लगातार मॉनिटर करता है, जिससे यूज़र्स एक यूज़र-फ्रेंडली वेब डैशबोर्ड के ज़रिए कभी भी और कहीं से भी पानी की क्वालिटी ट्रैक कर सकते हैं। जब भी कोई पैरामीटर सेफ़ लिमिट को पार करता है, तो सिस्टम तुरंत यूज़र्स को बताता है, जिससे तुरंत बचाव का एक्शन लिया जा सकता है। पोर्टेबल, सस्ता और इस्तेमाल में आसान होने के लिए डिज़ाइन किया गया हमारा सॉल्यूशन, ट्रेडिशनल लैबोरेटरी टेस्टिंग और लगातार ऑन-फील्ड मॉनिटरिंग की ज़रूरत के बीच के गैप को कम करता है, साथ ही बेहतर वॉटर मैनेजमेंट और हेल्दी कम्युनिटीज़ को बढ़ावा देता है।"
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
        
        // AI Page
        "back": "मागे",
        "new_chat": "नवीन चॅट",
        
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
        "salinity_vs_heavy_metals": "खारटपणा विरुद्ध जड धातू",


        // Calibration Page
         "alerts_title": "अलर्ट",
         "checking_status": "स्थिती तपासत आहे...",
         "calibration_wizard": "कॅलिब्रेशन विजार्ड",
         "hardware_cloud": "हार्डवेअर आणि क्लाउड सेटिंग्स",
         "battery_diag": "बॅटरी निदान",
         "twilio_settings": "ट्विलिओ एसएमएस सेटिंग्स",
         "target_phone": "लक्ष्य फोन क्रमांक",
         "danger_interval": "धोक्याचा कालावधी (तास)",
         "safe_interval": "सुरक्षित कालावधी (तास)",

         "about_text_1": "आम्ही कमी किमतीची IoT-आधारित पाणी गुणवत्ता देखरेख प्रणाली विकसित करत आहोत जी प्रमुख पाण्याच्या पॅरामीटर्सचे रिअल-टाइम विश्लेषण प्रदान करते. आमचे प्लॅटफॉर्म स्मार्ट सेन्सर्स, क्लाउड कनेक्टिव्हिटी आणि एआय सहाय्य एकत्रित करते जेणेकरून त्वरित सूचना, बुद्धिमान अंतर्दृष्टी आणि स्वयंचलित पीडीएफ अहवाल मिळतील. दूषिततेचे लवकर निदान करणे आणि विशेषतः ग्रामीण आणि वंचित समुदायांमध्ये सुरक्षित पाण्याच्या प्रवेशास समर्थन देणे हे उद्दिष्ट आहे.",
         "about_text_2": "ही प्रणाली पीएच, टर्बिडिटी, तापमान, टीडीएस आणि क्षारता यासारख्या महत्त्वाच्या निर्देशकांवर सतत लक्ष ठेवते, ज्यामुळे वापरकर्त्यांना वापरकर्ता-अनुकूल वेब डॅशबोर्डद्वारे कधीही आणि कुठूनही पाण्याची गुणवत्ता ट्रॅक करता येते. जेव्हा जेव्हा कोणताही पॅरामीटर सुरक्षित मर्यादा ओलांडतो तेव्हा ही प्रणाली वापरकर्त्यांना त्वरित सूचित करते, ज्यामुळे जलद प्रतिबंधात्मक कारवाई शक्य होते. पोर्टेबल, परवडणारे आणि वापरण्यास सोपे असे डिझाइन केलेले, आमचे समाधान पारंपारिक प्रयोगशाळा चाचणी आणि सतत ऑन-फिल्ड देखरेखीच्या गरजेमधील अंतर भरून काढते आणि स्मार्ट पाणी व्यवस्थापन आणि निरोगी समुदायांना प्रोत्साहन देते."
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

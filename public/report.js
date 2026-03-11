import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, get, query, orderByKey, limitToLast } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
import { jsPDF } from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm";

/* ===============================
   FIREBASE CONFIG
=============================== */
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

/* ===============================
   HELPER: TIMESTAMP CONVERTER
=============================== */
// The ESP32 saves time in seconds. JavaScript uses milliseconds. 
// This function safely converts the ESP32 time so the math works!
function getValidTimestampMs(ts) {
    if (!ts) return Date.now();
    return ts > 9999999999 ? ts : ts * 1000;
}

/* ===============================
   BUTTON EVENTS
=============================== */

document.getElementById("btn-current-report").addEventListener("click", () => {
    generateCurrentReport();
});

document.getElementById("btn-range-report").addEventListener("click", () => {
    const fromDate = document.getElementById("from-date").value;
    const toDate = document.getElementById("to-date").value;

    if (!fromDate || !toDate) {
        alert("Please select both dates.");
        return;
    }

    const from = new Date(fromDate).getTime();
    // Add 24 hours (86399999 ms) to include the entire "to" day until 11:59 PM
    const to = new Date(toDate).getTime() + 86399999; 

    generateCustomReport(from, to);
});


/* ===============================
   CURRENT READING REPORT (FIXED)
=============================== */
async function generateCurrentReport() {
    const btn = document.getElementById("btn-current-report");
    btn.innerText = "Fetching...";
    
    try {
        const historyRef = ref(database, 'sensor_history');
        // Efficient query: Tell Firebase to ONLY send the absolute newest record
        const historyQuery = query(historyRef, orderByKey(), limitToLast(1));

        const snapshot = await get(historyQuery);

        if (!snapshot.exists()) {
            alert("No data found in database.");
            return;
        }

        let latestReading = null;
        snapshot.forEach(child => {
            latestReading = child.val();
        });

        if (latestReading) {
            generateProfessionalPDF([latestReading], "Current Reading Report");
        }
    } catch (error) {
        console.error(error);
        alert("Error fetching report data.");
    } finally {
        btn.innerText = "Generate Current Report";
    }
}

/* ===============================
   CUSTOM DATE REPORT (FIXED)
=============================== */
async function generateCustomReport(from, to) {
    const btn = document.getElementById("btn-range-report");
    btn.innerText = "Fetching...";

    try {
        const historyRef = ref(database, 'sensor_history');
        const historyQuery = query(historyRef, orderByKey());
        const snapshot = await get(historyQuery);

        if (!snapshot.exists()) {
            alert("No data found in database.");
            return;
        }

        let filteredData = [];

        snapshot.forEach(child => {
            const data = child.val();
            if (data.timestamp) {
                // Convert to milliseconds before checking the date range!
                const tsMs = getValidTimestampMs(data.timestamp);
                
                if (tsMs >= from && tsMs <= to) {
                    filteredData.push(data);
                }
            }
        });

        if (filteredData.length === 0) {
            alert("No readings found in this specific date range.");
        } else {
            generateProfessionalPDF(filteredData, "Custom Date Range Report");
        }
    } catch (error) {
        console.error(error);
        alert("Error fetching custom range data.");
    } finally {
        btn.innerText = "Generate Custom Report";
    }
}


/* ===============================
   PROFESSIONAL PDF GENERATOR
=============================== */
function generateProfessionalPDF(dataArray, mode) {
    const doc = new jsPDF("p", "mm", "a4");

    const reportNo = "WQ-" + new Date().getTime();
    const today = new Date().toLocaleString();

    let y = 20;
    let pageNumber = 1;
    let sampleId = 1;

    // Header Band
    doc.setFillColor(25, 60, 120);
    doc.rect(0, 0, 210, 28, "F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("WATER QUALITY TEST REPORT", 105, 18, { align: "center" });

    doc.setTextColor(0,0,0);
    doc.setFontSize(10);
    y = 35;

    doc.text(`Report No: ${reportNo}`, 15, y);
    doc.text(`Report Type: ${mode}`, 15, y + 6);
    doc.text(`Generated On: ${today}`, 120, y);

    y += 15;
    doc.setDrawColor(180);
    doc.line(10, y, 200, y);
    y += 10;

    // Sample Loop
    dataArray.forEach(data => {
        if (y > 240) {
            addFooter();
            doc.addPage();
            pageNumber++;
            y = 20;
        }

        // Fix: Use our new converter function for the PDF output
        const tsMs = getValidTimestampMs(data.timestamp);
        const dateObj = new Date(tsMs);

        const date = dateObj.toLocaleDateString();
        const time = dateObj.toLocaleTimeString();

        // Sample Header Box
        doc.setFillColor(230, 240, 255);
        doc.rect(14, y - 6, 182, 16, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Sample ID: S-${sampleId}`, 18, y);

        doc.setFont("helvetica", "normal");
        doc.text(`Collection Date: ${date}`, 120, y);
        doc.text(`Collection Time: ${time}`, 120, y + 6);

        y += 14;

        // Table Header
        doc.setFillColor(25, 60, 120);
        doc.setTextColor(255,255,255);
        doc.rect(14, y - 6, 182, 8, "F");

        doc.text("Parameter", 18, y);
        doc.text("Result", 65, y);
        doc.text("Unit", 90, y);
        doc.text("WHO Limit", 115, y);
        doc.text("Status", 165, y);

        doc.setTextColor(0,0,0);
        y += 10;

        const parameters = [
            { name: "pH", value: data.ph, unit: "-", limit: "6.5 - 8.5" },
            { name: "TDS", value: data.tds, unit: "ppm", limit: "< 500" },
            { name: "Turbidity", value: data.turbidity, unit: "NTU", limit: "< 5" },
            { name: "Hardness", value: data.hardness, unit: "mg/L", limit: "< 250" },
            { name: "Chlorides", value: data.chlorides, unit: "mg/L", limit: "< 250" }
        ];

        parameters.forEach(p => {
            let status = "PASS";

            if (p.name === "pH" && (p.value < 6.5 || p.value > 8.5)) status = "FAIL";
            if (p.name === "TDS" && p.value > 500) status = "FAIL";
            if (p.name === "Hardness" && p.value > 250) status = "WARNING";

            doc.rect(14, y - 5, 182, 8);

            doc.text(p.name, 18, y);
            doc.text(String(p.value ?? "-"), 65, y);
            doc.text(p.unit, 90, y);
            doc.text(p.limit, 115, y);

            if (status === "FAIL") doc.setTextColor(200,0,0);
            else if (status === "WARNING") doc.setTextColor(255,140,0);
            else doc.setTextColor(0,150,0);

            doc.text(status, 165, y);
            doc.setTextColor(0,0,0);

            y += 10;
        });

        y += 10;
        sampleId++;
    });

    // Summary Section
    if (y > 230) {
        addFooter();
        doc.addPage();
        pageNumber++;
        y = 20;
    }

    doc.setFillColor(235, 240, 250);
    doc.rect(14, y, 182, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.text("Summary of Results", 18, y + 8);

    doc.setFont("helvetica", "normal");
    doc.text("Overall Water Quality: Evaluated per sample limits above.", 18, y + 16);
    
    y += 35;

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(80);

    const disclaimer =
        "This IoT-based water quality monitoring system is a prototype intended for indicative and educational purposes only. " +
        "The readings obtained may not match the accuracy of standard laboratory analytical methods and should not be used " +
        "for regulatory or medical decision-making.";

    const splitText = doc.splitTextToSize(disclaimer, 180);
    doc.text(splitText, 15, y);

    addFooter();
    doc.save("Professional_Water_Quality_Report.pdf");

    function addFooter() {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${pageNumber}`, 180, 290);
        doc.text("Generated by Water Quality Monitoring System", 14, 290);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. FIREBASE-READY UI RENDERER
    // ==========================================
function updateCalibrationsUI(data) {
        const phElement = document.getElementById("health-ph");
        const tdsElement = document.getElementById("health-tds");
        const turbElement = document.getElementById("health-turbidity");
        const alertElement = document.getElementById("calibration-alert");

        // Update Text Percentages
        if(phElement) phElement.innerText = data.healthPh + "%";
        if(tdsElement) tdsElement.innerText = data.healthTds + "%";
        if(turbElement) turbElement.innerText = data.healthTurbidity + "%";

        // ==========================================
        // NEW LOGIC: Check every sensor independently
        // ==========================================
        let failingSensors = []; // Create an empty list

        // Check each one and add to the list if it's under 60
        if (data.healthPh < 60) failingSensors.push("pH");
        if (data.healthTds < 60) failingSensors.push("TDS");
        if (data.healthTurbidity < 60) failingSensors.push("TURBIDITY");

        // If our list has anything in it, display the alert!
        if (failingSensors.length > 0) {
            // .join(" & ") connects them nicely (e.g., "TDS & TURBIDITY")
            let combinedNames = failingSensors.join(" & ");
            
            alertElement.innerText = `${combinedNames} SENSOR(S) NEED Calibrations`;
            alertElement.style.color = "var(--primary-accent)"; // Make it pink/red
        } else {
            alertElement.innerText = "ALL SENSORS HEALTHY";
            alertElement.style.color = "var(--text-light)";
        }
    }

    // ==========================================
    // 2. SIMULATED DATA FETCH (Replace with Firebase later)
    // ==========================================
    // In a real app, sensor health drops slowly over months. 
    // For the presentation, we will simulate static "degraded" values.
    const currentHealthData = {
        healthPh: 98,
        healthTds: 30,
        healthTurbidity: 45
    };
    
    updateCalibrationsUI(currentHealthData);

    // ==========================================
    // 3. BUTTON INTERACTIONS (INFO BOX)
    // ==========================================
    const infoDisplay = document.getElementById("info-display");
    const buttons = document.querySelectorAll(".calib-btn");

    const instructions = {
        "btn-ph": "pH Calibration SOP:\n\n1. Rinse probe with distilled water.\n2. Submerge in pH 7.0 buffer solution.\n3. Wait for reading to stabilize, then press 'Confirm'.\n4. Repeat with pH 4.0 buffer.",
        "btn-tds": "TDS Calibration SOP:\n\n1. Clean prongs with soft cloth.\n2. Submerge in 1413 µS/cm standard solution.\n3. Turn calibration screw until display reads exactly 1413.\n4. Save settings.",
        "btn-turbidity": "Turbidity Calibration SOP:\n\n1. Insert blank vial (0 NTU).\n2. Press 'Zero'.\n3. Insert 100 NTU standard vial.\n4. Press 'Calibrate' and wait for beep."
    };

    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Remove active class from all buttons
            buttons.forEach(b => b.classList.remove("active-btn"));
            // Add active class to clicked button
            e.target.classList.add("active-btn");
            // Update info text
            infoDisplay.innerText = instructions[e.target.id];
        });
    });
});
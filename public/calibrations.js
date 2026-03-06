import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

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
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const btnPh = document.getElementById("btn-ph");
    const btnTds = document.getElementById("btn-tds");
    const btnTurb = document.getElementById("btn-turbidity");
    const btnReset = document.getElementById("btn-factory-reset");
    const wizardDisplay = document.getElementById("wizard-display");

    const triggerRef = ref(database, 'settings/calibration/trigger');
    const statusRef = ref(database, 'settings/calibration/status');
    const lastCalRef = ref(database, 'settings/calibration/last_timestamp');

    let currentStatus = "idle";
    let isAuthorized = false;

    // ==========================================
    // 1. SECURITY: AUTHENTICATION CHECK
    // ==========================================
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isAuthorized = true;
            btnPh.disabled = false; btnTds.disabled = false; 
            btnTurb.disabled = false; btnReset.disabled = false;
        } else {
            isAuthorized = false;
            wizardDisplay.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">🔒 You must be Logged In to perform calibrations.</span>`;
            [btnPh, btnTds, btnTurb, btnReset].forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            });
            btnPh.innerHTML = "Login<br>Required";
            btnTds.innerHTML = "Login<br>Required";
            btnTurb.innerHTML = "Login<br>Required";
        }
    });

   // ==========================================
    // 1. SECURITY: AUTHENTICATION CHECK
    // ==========================================
    onAuthStateChanged(auth, (user) => {
        if (user) {
            isAuthorized = true;
            btnPh.disabled = false; btnTds.disabled = false; 
            btnTurb.disabled = false; btnReset.disabled = false;
        } else {
            isAuthorized = false;
            wizardDisplay.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">🔒 You must be Logged In to perform calibrations.</span>`;
            [btnPh, btnTds, btnTurb, btnReset].forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            });
            btnPh.innerHTML = "Login<br>Required";
            btnTds.innerHTML = "Login<br>Required";
            btnTurb.innerHTML = "Login<br>Required";
        }
    });

    // ==========================================
    // 2. EXPIRY & HISTORY LOGIC (Your Updated Version)
    // ==========================================
    onValue(lastCalRef, (snapshot) => {
        const ts = snapshot.val();
        
        // --- NEW: Handle Factory Reset (Timestamp is 0 or missing) ---
        if (!ts || ts === 0) {
            document.getElementById("last-cal-date").innerText = "None";
            document.getElementById("expiry-warning").style.display = "block";
            document.getElementById("expiry-warning").innerHTML = "⚠️ Calibration Not Done Yet. Factory defaults active.";
            document.getElementById("calibration-alert").innerText = "CALIBRATION REQUIRED";
            document.getElementById("calibration-alert").style.color = "#e74c3c";
        } 
        // --- Normal Timestamp Logic ---
        else {
            // Check if ESP32 sent seconds or milliseconds
            const ms = ts > 9999999999 ? ts : ts * 1000; 
            const calDate = new Date(ms);
            document.getElementById("last-cal-date").innerText = calDate.toLocaleDateString();

            const daysSince = (Date.now() - ms) / (1000 * 60 * 60 * 24);
            if (daysSince > 30) {
                document.getElementById("expiry-warning").style.display = "block";
                document.getElementById("expiry-warning").innerHTML = "⚠️ Calibration is older than 30 days. Recalibration recommended.";
                document.getElementById("calibration-alert").innerText = "RECALIBRATION OVERDUE";
                document.getElementById("calibration-alert").style.color = "#e74c3c";
            } else {
                document.getElementById("expiry-warning").style.display = "none";
                document.getElementById("calibration-alert").innerText = "CALIBRATION UP TO DATE";
                document.getElementById("calibration-alert").style.color = "#2ecc71";
            }
        }
    });

    // Listen to live ESP32 status updates for the loading spinner
    onValue(statusRef, (snapshot) => {
        currentStatus = snapshot.val();
    });

    // ==========================================
    // 2.5 LIVE HARDWARE & SENSOR HEALTH LISTENER (The New Math!)
    // ==========================================
    const hwRef = ref(database, 'sensors/hardware');
    onValue(hwRef, (snapshot) => {
        const hw = snapshot.val();
        if (hw) {
            // Update Battery Dashboard (Bottom of the page)
            if(document.getElementById("bat-soc")) document.getElementById("bat-soc").innerText = hw.bat_soc.toFixed(0) + "%";
            if(document.getElementById("bat-volt")) document.getElementById("bat-volt").innerText = hw.bat_volt.toFixed(2) + "V";
            if(document.getElementById("bat-temp")) document.getElementById("bat-temp").innerText = hw.bat_temp.toFixed(1) + "°C";

            // Update Sensor Health Percentages (Top of the page)
            const phEl = document.getElementById("health-ph");
            const tdsEl = document.getElementById("health-tds");
            const turbEl = document.getElementById("health-turbidity");

            if (phEl) {
                phEl.innerText = hw.health_ph.toFixed(0) + "%";
                // Turn text red if health drops below 40%
                phEl.style.color = hw.health_ph < 40 ? "#e74c3c" : "var(--text-light)"; 
            }
            if (tdsEl) {
                tdsEl.innerText = hw.health_tds.toFixed(0) + "%";
                tdsEl.style.color = hw.health_tds < 40 ? "#e74c3c" : "var(--text-light)";
            }
            if (turbEl) {
                turbEl.innerText = hw.health_turb.toFixed(0) + "%";
                turbEl.style.color = hw.health_turb < 40 ? "#e74c3c" : "var(--text-light)";
            }
        }
    });

    // ==========================================
    // 3. INTERACTIVE CALIBRATION WIZARD
    // ==========================================
    
    let isCalibrationActive = false;
    let currentCheckInterval = null;

    // Global Cancel Function
    function cancelCalibration() {
        isCalibrationActive = false;
        if (currentCheckInterval) clearInterval(currentCheckInterval); // Stop waiting for ESP32
        
        set(statusRef, "idle"); // Reset Firebase status
        set(triggerRef, "none"); // Tell ESP32 to abort
        
        wizardDisplay.innerHTML = "Select a sensor from the left to begin the secure, interactive calibration sequence.";
        document.querySelectorAll('.calib-btn').forEach(b => b.classList.remove('active-btn'));
    }

    // Send trigger to Firebase and wait securely for ESP32
    function executeCalibrationStep(triggerCommand, processingText, onSuccessCallback) {
        set(triggerRef, triggerCommand);
        set(statusRef, "calibrating"); 
        
        wizardDisplay.innerHTML = `
            <div style="text-align:center; padding: 30px 0; animation: pulse 1.5s infinite;">
                <div style="font-size: 3rem; margin-bottom: 15px;">⏳</div>
                <div style="color:#5A8DF8; font-weight:bold; font-size: 1.2rem;">${processingText}</div>
                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-top: 10px;">Waiting for ESP32 hardware to stabilize and respond...</p>
                <button id="loading-cancel-btn" class="calib-btn" style="margin-top: 20px; padding: 10px 20px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c;">Cancel Calibration</button>
            </div>
        `;

        document.getElementById("loading-cancel-btn").addEventListener("click", cancelCalibration);

        if (currentCheckInterval) clearInterval(currentCheckInterval);
        currentCheckInterval = setInterval(() => {
            if (currentStatus === "success") {
                clearInterval(currentCheckInterval);
                set(statusRef, "idle"); // Reset for next time
                if (onSuccessCallback) onSuccessCallback();
            }
        }, 1000);
    }

    // --- 1. DYNAMIC pH CALIBRATION ---
    let totalPhPoints = 1, currentPhPoint = 1;

    function startPhSequence() {
        isCalibrationActive = true;
        wizardDisplay.innerHTML = `
            <h3 style="color: #5A8DF8; margin-top: 0; font-size: 1.5rem;">pH Calibration Setup</h3>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">How many calibration points would you like to use?</p>
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <input type="number" id="ph-points" min="1" value="3" class="cal-input" style="width: 80px; text-align: center;">
                <span style="font-size: 1.1rem; margin-left: 15px; color: white;">Points</span>
            </div>
            <div style="display: flex; gap: 15px;">
                <button id="ph-setup-btn" class="calib-btn blue-btn" style="flex: 1; padding:12px;">Start</button>
                <button id="ph-cancel-btn" class="calib-btn" style="flex: 1; padding:12px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c;">Cancel</button>
            </div>
        `;

        document.getElementById("ph-cancel-btn").addEventListener("click", cancelCalibration);
        document.getElementById("ph-setup-btn").addEventListener("click", () => {
            const pts = parseInt(document.getElementById("ph-points").value);
            if (pts < 1 || isNaN(pts)) return alert("Select at least 1 point.");
            totalPhPoints = pts; currentPhPoint = 1;
            renderPhPoint();
        });
    }

    function renderPhPoint() {
        wizardDisplay.innerHTML = `
            <h3 style="color: #FE7693; margin-top: 0; font-size: 1.5rem;">pH Calibration - Point ${currentPhPoint} of ${totalPhPoints}</h3>
            <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FE7693; text-align: left;">
                <ol style="color: #fff; margin: 0; padding-left: 15px; line-height: 1.6; font-size: 0.95rem;">
                    <li>Rinse the sensor with distilled water.</li>
                    <li>Dip it into your standard buffer solution.</li>
                    <li>Enter the exact pH value of the solution below.</li>
                </ol>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <input type="number" id="ph-val" step="0.01" placeholder="e.g. 7.00" class="cal-input" style="width: 120px;">
                <span style="font-size: 1.1rem; margin-left: 15px; color: white;">pH</span>
            </div>
            <div style="display: flex; gap: 15px;">
                <button id="ph-measure-btn" class="calib-btn pink-btn" style="flex: 2; padding:12px;">Calibrate Point ${currentPhPoint}</button>
                <button id="ph-cancel-btn" class="calib-btn" style="flex: 1; padding:12px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c;">Cancel</button>
            </div>
        `;

        document.getElementById("ph-cancel-btn").addEventListener("click", cancelCalibration);
        document.getElementById("ph-measure-btn").addEventListener("click", () => {
            const val = parseFloat(document.getElementById("ph-val").value);
            if (isNaN(val)) return alert("Please enter a valid pH buffer value.");

            set(ref(database, 'settings/calibration/target_value'), val); 

            let triggerCmd = "ph_7_cal", processTxt = "Calculating Neutral Offset";
            if (val < 6.0) { triggerCmd = "ph_4_cal"; processTxt = "Calculating Acidic Slope"; }
            else if (val > 8.0) { triggerCmd = "ph_10_cal"; processTxt = "Calculating Alkaline Slope"; }

            executeCalibrationStep(triggerCmd, `Reading pH ${val} & ${processTxt}`, () => {
                if (currentPhPoint < totalPhPoints) { currentPhPoint++; renderPhPoint(); } 
                else { renderSequenceDone("pH"); }
            });
        });
    }

    btnPh.addEventListener("click", () => {
        if (!isAuthorized) return;
        if (isCalibrationActive) return alert("⚠️ Please finish or cancel the current calibration first.");
        document.querySelectorAll('.calib-btn').forEach(b => b.classList.remove('active-btn'));
        btnPh.classList.add('active-btn');
        startPhSequence();
    });

    // --- 2. DYNAMIC TDS CALIBRATION ---
    let totalTdsPoints = 1, currentTdsPoint = 1;

    function startTdsSequence() {
        isCalibrationActive = true;
        wizardDisplay.innerHTML = `
            <h3 style="color: #5A8DF8; margin-top: 0; font-size: 1.5rem;">TDS Calibration Setup</h3>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">How many calibration points would you like to use?</p>
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <input type="number" id="tds-points" min="1" value="1" class="cal-input" style="width: 80px; text-align: center;">
                <span style="font-size: 1.1rem; margin-left: 15px; color: white;">Points</span>
            </div>
            <div style="display: flex; gap: 15px;">
                <button id="tds-setup-btn" class="calib-btn blue-btn" style="flex: 1; padding:12px;">Start</button>
                <button id="tds-cancel-btn" class="calib-btn" style="flex: 1; padding:12px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c;">Cancel</button>
            </div>
        `;

        document.getElementById("tds-cancel-btn").addEventListener("click", cancelCalibration);
        document.getElementById("tds-setup-btn").addEventListener("click", () => {
            const pts = parseInt(document.getElementById("tds-points").value);
            if (pts < 1 || isNaN(pts)) return alert("Enter at least 1 point.");
            totalTdsPoints = pts; currentTdsPoint = 1;
            renderTdsPoint();
        });
    }

    function renderTdsPoint() {
        wizardDisplay.innerHTML = `
            <h3 style="color: #FE7693; margin-top: 0; font-size: 1.5rem;">TDS Calibration - Point ${currentTdsPoint} of ${totalTdsPoints}</h3>
            <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FE7693; text-align: left;">
                <p style="color: #fff; margin: 0; line-height: 1.6; font-size: 0.95rem;">Rinse the sensor, place it in the standard KCl solution, and enter the solution's expected ppm value below.</p>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <input type="number" id="tds-val" placeholder="e.g. 500" class="cal-input" style="width: 120px;">
                <span style="font-size: 1.1rem; margin-left: 15px; color: white;">ppm</span>
            </div>
            <div style="display: flex; gap: 15px;">
                <button id="tds-measure-btn" class="calib-btn pink-btn" style="flex: 2; padding:12px;">Calibrate Point ${currentTdsPoint}</button>
                <button id="tds-cancel-btn" class="calib-btn" style="flex: 1; padding:12px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c;">Cancel</button>
            </div>
        `;

        document.getElementById("tds-cancel-btn").addEventListener("click", cancelCalibration);
        document.getElementById("tds-measure-btn").addEventListener("click", () => {
            const val = parseFloat(document.getElementById("tds-val").value);
            if (isNaN(val)) return alert("Please enter a valid ppm value.");

            set(ref(database, 'settings/calibration/target_value'), val); 

            executeCalibrationStep("tds_cal", `Reading TDS & Calculating K-Value for ${val} ppm`, () => {
                if (currentTdsPoint < totalTdsPoints) { currentTdsPoint++; renderTdsPoint(); } 
                else { renderSequenceDone("TDS"); }
            });
        });
    }

    btnTds.addEventListener("click", () => {
        if (!isAuthorized) return;
        if (isCalibrationActive) return alert("⚠️ Please finish or cancel the current calibration first.");
        document.querySelectorAll('.calib-btn').forEach(b => b.classList.remove('active-btn'));
        btnTds.classList.add('active-btn');
        startTdsSequence();
    });

    // --- 3. DYNAMIC TURBIDITY CALIBRATION ---
    let totalTurbPoints = 1, currentTurbPoint = 1;

    function startTurbSequence() {
        isCalibrationActive = true;
        wizardDisplay.innerHTML = `
            <h3 style="color: #5A8DF8; margin-top: 0; font-size: 1.5rem;">Turbidity Calibration Setup</h3>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">How many calibration points would you like to use?</p>
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <input type="number" id="turb-points" min="1" value="2" class="cal-input" style="width: 80px; text-align: center;">
                <span style="font-size: 1.1rem; margin-left: 15px; color: white;">Points</span>
            </div>
            <div style="display: flex; gap: 15px;">
                <button id="turb-setup-btn" class="calib-btn blue-btn" style="flex: 1; padding:12px;">Start</button>
                <button id="turb-cancel-btn" class="calib-btn" style="flex: 1; padding:12px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c;">Cancel</button>
            </div>
        `;

        document.getElementById("turb-cancel-btn").addEventListener("click", cancelCalibration);
        document.getElementById("turb-setup-btn").addEventListener("click", () => {
            const pts = parseInt(document.getElementById("turb-points").value);
            if (pts < 1 || isNaN(pts)) return alert("Enter at least 1 point.");
            totalTurbPoints = pts; currentTurbPoint = 1;
            renderTurbPoint();
        });
    }

    function renderTurbPoint() {
        wizardDisplay.innerHTML = `
            <h3 style="color: #FE7693; margin-top: 0; font-size: 1.5rem;">Turbidity Calibration - Point ${currentTurbPoint} of ${totalTurbPoints}</h3>
            <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FE7693; text-align: left;">
                <p style="color: #fff; margin: 0; line-height: 1.6; font-size: 0.95rem;">Wipe the sensor vial clean, place it in the standard solution, close the lid, and enter the NTU value below (use 0 for distilled water).</p>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <input type="number" id="turb-val" placeholder="e.g. 0" class="cal-input" style="width: 120px;">
                <span style="font-size: 1.1rem; margin-left: 15px; color: white;">NTU</span>
            </div>
            <div style="display: flex; gap: 15px;">
                <button id="turb-measure-btn" class="calib-btn pink-btn" style="flex: 2; padding:12px;">Calibrate Point ${currentTurbPoint}</button>
                <button id="turb-cancel-btn" class="calib-btn" style="flex: 1; padding:12px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c;">Cancel</button>
            </div>
        `;

        document.getElementById("turb-cancel-btn").addEventListener("click", cancelCalibration);
        document.getElementById("turb-measure-btn").addEventListener("click", () => {
            const val = parseFloat(document.getElementById("turb-val").value);
            if (isNaN(val)) return alert("Please enter a valid NTU value.");

            set(ref(database, 'settings/calibration/target_value'), val); 

            let triggerCmd = val === 0 ? "turb_zero" : "turb_100";
            executeCalibrationStep(triggerCmd, `Reading & Calibrating Sensor to ${val} NTU`, () => {
                if (currentTurbPoint < totalTurbPoints) { currentTurbPoint++; renderTurbPoint(); } 
                else { renderSequenceDone("Turbidity"); }
            });
        });
    }

    btnTurb.addEventListener("click", () => {
        if (!isAuthorized) return;
        if (isCalibrationActive) return alert("⚠️ Please finish or cancel the current calibration first.");
        document.querySelectorAll('.calib-btn').forEach(b => b.classList.remove('active-btn'));
        btnTurb.classList.add('active-btn');
        startTurbSequence();
    });

    // --- SHARED DONE SCREEN & FACTORY RESET ---
    function renderSequenceDone(sensorName) {
        isCalibrationActive = false; // Unlock the UI!
        if (sensorName === "TDS") set(triggerRef, "calc_tds_curve");
        if (sensorName === "Turbidity") set(triggerRef, "calc_turb_curve");

        // --- NEW: Tell ESP32 to run final math and LOG IT! ---/
        if (sensorName === "pH") set(triggerRef, "ph_done");
        if (sensorName === "TDS") set(triggerRef, "calc_tds_curve");
        if (sensorName === "Turbidity") set(triggerRef, "calc_turb_curve");

        wizardDisplay.innerHTML = `
            <div style="text-align:center; padding: 30px 0;">
                <div style="font-size: 4rem; margin-bottom: 15px;"></div>
                <h3 style="color: #2ecc71; margin-top: 0; font-size: 1.8rem;">Calibration Complete!</h3>
                <p style="color: rgba(255,255,255,0.7); font-size: 1rem; line-height: 1.6;">The ${sensorName} sensor has been successfully calibrated and saved to the ESP32's permanent EEPROM memory.</p>
                <button id="btn-finish-seq" class="calib-btn" style="margin-top: 20px; padding: 10px 30px; border: 1px solid #2ecc71; color: #2ecc71; background: transparent;">Done</button>
            </div>
        `;
        document.getElementById("btn-finish-seq").addEventListener("click", () => {
            wizardDisplay.innerHTML = "Select a sensor to begin the secure, interactive calibration sequence.";
            document.querySelectorAll('.calib-btn').forEach(b => b.classList.remove('active-btn'));
        });

        
    }

    btnReset.addEventListener("click", () => {
        if (!isAuthorized) return;
        if (isCalibrationActive) return alert("⚠️ Please finish or cancel the current calibration first.");
        const confirmReset = confirm("Are you sure you want to wipe all calibration offsets? This cannot be undone.");
        if (confirmReset) {
            executeCalibrationStep("factory_reset", "Wiping EEPROM memory", () => {
                wizardDisplay.innerHTML = "<div style='text-align:center; color:#2ecc71; font-weight:bold; font-size:1.2rem; margin-top: 20px;'>✅ Factory Reset Complete! All offsets set to 0.</div>";
            });
        }
    });

    
}); // <--- Final closing bracket

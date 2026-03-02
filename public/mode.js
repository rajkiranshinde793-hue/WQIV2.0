import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const database = getDatabase();
    const modeRef = ref(database, 'settings/monitoring_control/mode');
    const triggerRef = ref(database, 'settings/monitoring_control/trigger_reading');

    const btnContinuous = document.getElementById('btn-continuous');
    const btnOneTime = document.getElementById('btn-onetime');
    const btnStart = document.getElementById('btn-start-monitoring');
    const msgArea = document.getElementById('status-message-area');

    // 1. Continuous Mode Click
    btnContinuous.addEventListener('click', () => {
        set(modeRef, 'constant'); // Save to Firebase
        msgArea.style.display = 'block';
        msgArea.innerHTML = "Continuous mode is ON.<br>Redirecting to live dashboard in <span id='countdown'>6</span> seconds...";
        btnStart.style.display = 'none';

        let count = 6;
        const interval = setInterval(() => {
            count--;
            document.getElementById('countdown').innerText = count;
            if (count <= 0) {
                clearInterval(interval);
                window.location.href = "dashboard.html"; // Redirect
            }
        }, 1000);
    });

    // 2. One-Time Mode Click
    btnOneTime.addEventListener('click', () => {
        msgArea.style.display = 'block';
        msgArea.style.color = "#FE7693";
        msgArea.style.borderColor = "#FE7693";
        msgArea.style.backgroundColor = "rgba(254, 118, 147, 0.1)";
        msgArea.innerHTML = "One-Time Mode selected.<br>Press the Start button below to take a reading.";
        btnStart.style.display = 'inline-block';
    });

    // 3. Start Monitoring Click
    btnStart.addEventListener('click', () => {
        set(modeRef, 'one-time'); // Set mode
        set(triggerRef, true);    // Trigger the reading
        
        btnStart.innerText = "Triggering Sensor...";
        setTimeout(() => {
            window.location.href = "dashboard.html"; // Redirect immediately
        }, 1000);
    });
});
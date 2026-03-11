import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
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
    const btnContinuous = document.getElementById('btn-continuous');
    const btnOneTime = document.getElementById('btn-onetime');
    const btnStart = document.getElementById('btn-start-monitoring');
    const msgArea = document.getElementById('status-message-area');

    // Check authentication state
    let isAuthorized = false;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            isAuthorized = true;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', user.email);
            // Enable buttons
            btnContinuous.disabled = false;
            btnOneTime.disabled = false;
        } else {
            isAuthorized = false;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            // Show login required message
            msgArea.style.display = 'block';
            msgArea.innerHTML = '<span style="color: #e74c3c; font-weight: bold;">🔒 You must be logged in to change the monitoring mode.</span><br><a href="login.html?redirect=mode.html" style="color: #5A8DF8; text-decoration: underline;">Click here to login</a>';
            // Disable buttons
            btnContinuous.disabled = true;
            btnOneTime.disabled = true;
            btnContinuous.style.opacity = "0.5";
            btnOneTime.style.opacity = "0.5";
            btnContinuous.style.cursor = "not-allowed";
            btnOneTime.style.cursor = "not-allowed";
        }
    });

    // 1. Continuous Mode Click
    btnContinuous.addEventListener('click', () => {
        if (!isAuthorized) {
            alert('Please login to change the monitoring mode.');
            window.location.href = 'login.html?redirect=mode.html';
            return;
        }
        
        const modeRef = ref(database, 'settings/monitoring_control/mode');
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
        if (!isAuthorized) {
            alert('Please login to change the monitoring mode.');
            window.location.href = 'login.html?redirect=mode.html';
            return;
        }
        
        msgArea.style.display = 'block';
        msgArea.style.color = "#FE7693";
        msgArea.style.borderColor = "#FE7693";
        msgArea.style.backgroundColor = "rgba(254, 118, 147, 0.1)";
        msgArea.innerHTML = "One-Time Mode selected.<br>Press the Start button below to take a reading.";
        btnStart.style.display = 'inline-block';
    });

    // 3. Start Monitoring Click
    btnStart.addEventListener('click', () => {
        if (!isAuthorized) {
            alert('Please login to change the monitoring mode.');
            window.location.href = 'login.html?redirect=mode.html';
            return;
        }
        
        const modeRef = ref(database, 'settings/monitoring_control/mode');
        const triggerRef = ref(database, 'settings/monitoring_control/trigger_reading');
        
        set(modeRef, 'one-time'); // Set mode
        set(triggerRef, true);    // Trigger the reading
        
        btnStart.innerText = "Triggering Sensor...";
        setTimeout(() => {
            window.location.href = "dashboard.html"; // Redirect immediately
        }, 1000);
    });
});


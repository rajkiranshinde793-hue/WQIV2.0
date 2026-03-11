import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, onValue, push, query, limitToLast, orderByKey, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
document.addEventListener("DOMContentLoaded", () => {
    // Global settings
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    const maxDataPoints = 20;

    // Colors
    const colorPink = '#FE7693';
    const colorBlue = '#5A8DF8';

    // Store history for the dynamic X-axis
    let dataHistory = {
        labels: [],
        temp: [], ph: [],
        tds: [], ec: [],
        turbidity: [], tss: [],
        hardness: [], chlorides: [],
        salinity: [], metals: []
    };

    // Water quality thresholds
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

    // Helper to create dual-axis combined charts with responsive options
    function createCombinedChart(canvasId, label1, label2, unit1, unit2) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Check if mobile view
        const isMobile = window.innerWidth <= 900;
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: dataHistory.labels,
                datasets: [
                    {
                        label: label1 + ' ' + unit1,
                        data: [],
                        borderColor: colorPink,
                        backgroundColor: 'rgba(254, 118, 147, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: label2 + ' ' + unit2,
                        data: [],
                        borderColor: colorBlue,
                        borderDash: [5, 5], 
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                plugins: { 
                    legend: { 
                        position: 'top',
                        display: !isMobile,
                        labels: {
                            font: { size: isMobile ? 10 : 12 },
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Time', color: 'rgba(255, 255, 255, 0.7)' },
                        ticks: { 
                            maxRotation: 45, 
                            minRotation: 45,
                            font: { size: isMobile ? 8 : 10 },
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        type: 'linear', display: true, position: 'left',
                        title: { display: true, text: label1, color: 'rgba(255, 255, 255, 0.7)' },
                        ticks: { 
                            font: { size: isMobile ? 8 : 10 },
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right',
                        title: { display: true, text: label2, color: 'rgba(255, 255, 255, 0.7)' },
                        ticks: { 
                            font: { size: isMobile ? 8 : 10 },
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: { drawOnChartArea: false } 
                    }
                }
            }
        });
    }

    // Initialize the 5 Combined Charts
    const phTempChart = createCombinedChart('phTempChart', 'pH', 'Temperature', '(0-14)', '(°C)');
    const tdsEcChart = createCombinedChart('tdsEcChart', 'TDS', 'EC', '(PPM)', '(S/M)');
    const turbTssChart = createCombinedChart('turbTssChart', 'Turbidity', 'TSS', '(NTU)', '(PPM)');
    // Function to analyze parameter and return status
    function analyzeParameter(param, value) {
        const val = parseFloat(value);
        const threshold = thresholds[param];
        
        if (!threshold) return 'good';
        
        switch(param) {
            case 'ph':
                if (val < threshold.min || val > threshold.max) return 'danger';
                return 'good';
            case 'tds':
            case 'tss':
            case 'chlorides':
            case 'salinity':
                if (val > threshold.max) return 'danger';
                return 'good';
            case 'turbidity':
                if (val > threshold.max) return 'danger';
                if (val > 0.5) return 'warning';
                return 'good';
            case 'ec':
                if (val > threshold.max) return 'warning';
                return 'good';
            case 'temp':
                if (val < threshold.min || val > threshold.max) return 'warning';
                return 'good';
            case 'hardness':
                if (val > threshold.max) return 'warning';
                return 'good';
            case 'metals':
                if (val > threshold.max) return 'danger';
                if (val > 0.005) return 'warning';
                return 'good';
            default:
                return 'good';
        }
    }

    // Update status indicator
    function updateStatus(param, status) {
        const statusEl = document.getElementById(`status-${param}`);
        const cardEl = document.getElementById(`val-${param}`)?.closest('.sensor-card');
        
        if (statusEl) {
            statusEl.className = 'sensor-status ' + status;
            statusEl.innerText = status.charAt(0).toUpperCase() + status.slice(1);
        }
        
        if (cardEl) {
            cardEl.classList.remove('status-good', 'status-warning', 'status-danger');
            cardEl.classList.add('status-' + status);
        }
    }

    // Calculate overall quality
    function calculateOverallQuality(data) {
        const params = ['ph', 'tds', 'turbidity', 'ec', 'temp', 'hardness', 'chlorides', 'tss', 'salinity', 'metals'];
        let hasDanger = false;
        let hasWarning = false;
        
        params.forEach(param => {
            const status = analyzeParameter(param, data[param]);
            if (status === 'danger') hasDanger = true;
            if (status === 'warning') hasWarning = true;
        });
        
        if (hasDanger) return { status: 'danger', text: 'Unsafe' };
        if (hasWarning) return { status: 'warning', text: 'Caution' };
        return { status: 'good', text: 'Drinkable' };
    }

    // Update function - only updates live text values
    function updateDashboardUI(data) {
        if(document.getElementById("val-temp")) document.getElementById("val-temp").innerText = data.temp + " °C";
        let phValue = parseFloat(data.ph);

         // Clamp pH between 0 and 14
         if (phValue < 0) phValue = 0;
         if (phValue > 14) phValue = 14;

         document.getElementById("val-ph").innerText = phValue.toFixed(2);
        if(document.getElementById("val-tds")) document.getElementById("val-tds").innerText = data.tds + " PPM";
        if(document.getElementById("val-ec")) document.getElementById("val-ec").innerText = data.ec + " S/M";
        if(document.getElementById("val-turbidity")) document.getElementById("val-turbidity").innerText = data.turbidity + " NTU";
        if(document.getElementById("val-tss")) document.getElementById("val-tss").innerText = data.tss + " PPM";
        if(document.getElementById("val-hardness")) document.getElementById("val-hardness").innerText = data.hardness + " N/mm²";
        if(document.getElementById("val-chlorides")) document.getElementById("val-chlorides").innerText = data.chlorides + " Mmol/L";
        if(document.getElementById("val-salinity")) document.getElementById("val-salinity").innerText = data.salinity + " PPM";
        if(document.getElementById("val-metals")) document.getElementById("val-metals").innerText = data.metals + " g/cm3";

        // Update status indicators
        updateStatus('ph', analyzeParameter('ph', data.ph));
        updateStatus('tds', analyzeParameter('tds', data.tds));
        updateStatus('turbidity', analyzeParameter('turbidity', data.turbidity));
        updateStatus('ec', analyzeParameter('ec', data.ec));
        updateStatus('temp', analyzeParameter('temp', data.temp));
        updateStatus('hardness', analyzeParameter('hardness', data.hardness));
        updateStatus('chlorides', analyzeParameter('chlorides', data.chlorides));
        updateStatus('tss', analyzeParameter('tss', data.tss));
        updateStatus('salinity', analyzeParameter('salinity', data.salinity));
        updateStatus('metals', analyzeParameter('metals', data.metals));

        // Update overall quality
        const overall = calculateOverallQuality(data);
        if(document.getElementById("val-quality")) document.getElementById("val-quality").innerText = overall.text;
        updateStatus('quality', overall.status);
    }

    // Update all charts - extracted from original updateDashboardUI
    function updateAllCharts() {
        phTempChart.data.datasets[0].data = dataHistory.ph;
        phTempChart.data.datasets[1].data = dataHistory.temp;
        phTempChart.update();

        tdsEcChart.data.datasets[0].data = dataHistory.tds;
        tdsEcChart.data.datasets[1].data = dataHistory.ec;
        tdsEcChart.update();

        turbTssChart.data.datasets[0].data = dataHistory.turbidity;
        turbTssChart.data.datasets[1].data = dataHistory.tss;
        turbTssChart.update();

    }

    // ============================================
    // FIREBASE INTEGRATION (Modern Modular SDK)
    // ============================================
    
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
    const sensorRef = ref(database, 'sensors/water-quality');

    // Real-time listener: Whenever ESP32 pushes data, this triggers instantly
    onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateDashboardUI(data);
        } else {
            console.log("No data available at sensors/water-quality");
        }
    });

    // History retrieval: Load historical data using Firebase's native chronological keys
    const historyRef = ref(database, 'sensor_history');
    const historyQuery = query(historyRef, orderByKey(), limitToLast(20));

    onValue(historyQuery, (snapshot) => {
        // Clear existing data history
        dataHistory.labels = [];
        dataHistory.temp = [];
        dataHistory.ph = [];
        dataHistory.tds = [];
        dataHistory.ec = [];
        dataHistory.turbidity = [];
        dataHistory.tss = [];
        dataHistory.hardness = [];
        dataHistory.chlorides = [];
        dataHistory.salinity = [];
        dataHistory.metals = [];

        // Iterate through data using forEach() to guarantee chronological order
      let startTime = null;

snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();

    if (!startTime && data.timestamp) {
        startTime = data.timestamp;
    }

    let seconds = 0;
    if (data.timestamp && startTime) {
        seconds = Math.floor((data.timestamp - startTime) / 1000);
    }

    dataHistory.labels.push(seconds + "s");

    dataHistory.ph.push(data.ph || 0);
    dataHistory.temp.push(data.temp || 0);
    dataHistory.tds.push(data.tds || 0);
    dataHistory.ec.push(data.ec || 0);
    dataHistory.turbidity.push(data.turbidity || 0);
    dataHistory.tss.push(data.tss || 0);
});

        // Update all charts with the retrieved history data
        updateAllCharts();
    });

    // ============================================
    // MODAL FUNCTIONALITY FOR INDIVIDUAL GRAPHS
    // ============================================
    
    // Parameter display names
    const paramNames = {
        ph: 'pH', tds: 'TDS', turbidity: 'Turbidity', ec: 'EC',
        temp: 'Temperature', hardness: 'Hardness', chlorides: 'Chlorides',
        tss: 'TSS', salinity: 'Salinity', metals: 'Heavy Metals'
    };
    
    const paramUnits = {
        ph: '', tds: 'PPM', turbidity: 'NTU', ec: 'S/M',
        temp: '°C', hardness: 'N/mm²', chlorides: 'Mmol/L',
        tss: 'PPM', salinity: 'PPM', metals: 'g/cm³'
    };

    let modalChart = null;
    let currentModalParam = null;
    let customChart = null;

    const graphModal = document.getElementById('graphModal');
    const customGraphModal = document.getElementById('customGraphModal');
    const modalTitle = document.getElementById('modalTitle');

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === graphModal) graphModal.style.display = 'none';
        if (event.target === customGraphModal) customGraphModal.style.display = 'none';
    };

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.onclick = function() { graphModal.style.display = 'none'; };
    });

    document.querySelector('.custom-graph-close').onclick = function() {
        customGraphModal.style.display = 'none';
    };

    // Create individual parameter chart with responsive options
    function createIndividualChart(param) {
        const ctx = document.getElementById('modalChart').getContext('2d');
        if (modalChart) modalChart.destroy();

        const isMobile = window.innerWidth <= 900;

        modalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dataHistory.labels,
                datasets: [{
                    label: paramNames[param] + ' ' + paramUnits[param],
                    data: dataHistory[param],
                    borderColor: colorPink,
                    backgroundColor: 'rgba(254, 118, 147, 0.1)',
                    fill: true, tension: 0.4
                }]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                animation: { duration: 0 },
                plugins: { 
                    legend: { 
                        position: 'top',
                        display: !isMobile,
                        labels: {
                            font: { size: isMobile ? 10 : 12 },
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'Time', color: 'rgba(255, 255, 255, 0.7)' }, 
                        ticks: { 
                            maxRotation: 45, 
                            minRotation: 45,
                            font: { size: isMobile ? 8 : 10 },
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    y: { 
                        title: { display: true, text: paramNames[param], color: 'rgba(255, 255, 255, 0.7)' },
                        ticks: {
                            font: { size: isMobile ? 8 : 10 },
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
        currentModalParam = param;
        return modalChart;
    }

    // Update individual chart
    function updateIndividualChart() {
        if (modalChart && currentModalParam) {
            modalChart.data.labels = dataHistory.labels;
            modalChart.data.datasets[0].data = dataHistory[currentModalParam];
            modalChart.update();
        }
    }

    // Click event for sensor cards
    document.querySelectorAll('.sensor-card.clickable').forEach(card => {
        card.addEventListener('click', function() {
            const param = this.getAttribute('data-param');
            if (param && paramNames[param]) {
                modalTitle.textContent = paramNames[param] + ' vs Time';
                createIndividualChart(param);
                graphModal.style.display = 'block';
            }
        });
    });

    // Custom Graph Functionality
    const customGraphBtn = document.getElementById('customGraphBtn');
    const plotCustomGraphBtn = document.getElementById('plotCustomGraph');
    const xAxisSelect = document.getElementById('xAxisSelect');
    const yAxisSelect = document.getElementById('yAxisSelect');

    customGraphBtn.onclick = function() {
        customGraphModal.style.display = 'block';
    };

   plotCustomGraphBtn.onclick = function() {

    const xParam = xAxisSelect.value;
    const yParam = yAxisSelect.value;
    const ctx = document.getElementById('customModalChart').getContext('2d');

    if (customChart) customChart.destroy();

    customChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataHistory.labels,
            datasets: [
                {
                    label: paramNames[xParam] + ' ' + paramUnits[xParam],
                    data: dataHistory[xParam],
                    borderColor: '#FE7693',
                    backgroundColor: 'rgba(254,118,147,0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: paramNames[yParam] + ' ' + paramUnits[yParam],
                    data: dataHistory[yParam],
                    borderColor: '#5A8DF8',
                    borderDash: [5,5],
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Seconds)'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: paramNames[xParam]
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: paramNames[yParam]
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

};

   function updateCustomChart() {
    if (customChart) {
        const xParam = xAxisSelect.value;
        const yParam = yAxisSelect.value;

        customChart.data.labels = dataHistory.labels;
        customChart.data.datasets[0].data = dataHistory[xParam];
        customChart.data.datasets[1].data = dataHistory[yParam];

        customChart.update();
    }
}

    // Hook into updateDashboardUI
    const originalUpdateDashboardUI = updateDashboardUI;
    updateDashboardUI = function(data) {
        originalUpdateDashboardUI(data);
        updateIndividualChart();
        updateCustomChart();
    };

    // ============================================
    // DASHBOARD MODE BADGE LISTENER
    // ============================================
    const badgeEl = document.getElementById('active-mode-badge');
    const floatBtn = document.getElementById('floating-take-reading');
    const modeListenRef = ref(database, 'settings/monitoring_control/mode');
    const triggerWriteRef = ref(database, 'settings/monitoring_control/trigger_reading');

    onValue(modeListenRef, (snapshot) => {
        const mode = snapshot.val();
        if (mode === 'one-time') {
            badgeEl.innerText = "Mode: One-Time";
            badgeEl.style.color = "#FE7693";
            floatBtn.style.display = "inline-block";
        } else {
            badgeEl.innerText = "Mode: Continuous (24/7)";
            badgeEl.style.color = "#5A8DF8";
            floatBtn.style.display = "none";
        }
    });

   // ... (keep the onValue(modeListenRef, ...) code above this)

    floatBtn.addEventListener('click', () => {
        // 1. Disable the button so the user can't spam it while ESP32 is working
        floatBtn.disabled = true;
        floatBtn.style.pointerEvents = 'none';
        floatBtn.style.opacity = '0.8';

        // 2. Send the trigger to Firebase
        set(triggerWriteRef, true);
        
        // 3. Start the 10-second countdown
        let count = 10;
        floatBtn.innerText = `Reading... ${count}s`;
        
        const countdownInterval = setInterval(() => {
            count--;
            
            if (count > 0) {
                // Update the timer text
                floatBtn.innerText = `Reading... ${count}s`;
            } else {
                // 4. Timer is finished! Show Success Message
                clearInterval(countdownInterval);
                floatBtn.innerText = "Updated! ";
                floatBtn.style.backgroundColor = "#2ecc71"; // Turn it a nice success green
                
                // 5. Reset the button back to normal after 3 seconds
                setTimeout(() => {
                    floatBtn.innerText = "Take Reading";
                    floatBtn.style.backgroundColor = ""; // Remove inline green color
                    floatBtn.disabled = false;
                    floatBtn.style.pointerEvents = 'auto';
                    floatBtn.style.opacity = '1';
                }, 3000);
            }
        }, 1000); // 1000 milliseconds = 1 second
    });

}); // <--- Make sure this final closing bracket stays at the very bottom!

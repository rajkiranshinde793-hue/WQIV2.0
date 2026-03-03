/**
 * Water Quality Dashboard - Historical Data Retrieval
 * 
 * This JavaScript code retrieves historical sensor data from Firebase
 * using query() and limitToLast(20) to fetch only the last 20 readings.
 * 
 * Compatible with Firebase Web SDK v10+ (Modular)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, query, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    // Global settings
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    const maxDataPoints = 20;

    // Colors
    const colorPink = '#FE7693';
    const colorBlue = '#5A8DF8';

    // Firebase Configuration
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

    // Store history data
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

    // Parameter display names and units
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

    // ==================== FETCH HISTORICAL DATA ====================
    
    /**
     * Fetch historical data from Firebase using query()
     * Gets the last 20 readings from /sensor_history
     */
    function fetchHistoricalData() {
        const historyRef = ref(database, 'sensor_history');
        
        // Create query to get last 20 readings
        // Note: For this to work, you need to store data with Firebase push() 
        // which creates keys like "-Nxxxxx" that sort chronologically
        const historyQuery = query(
            historyRef,
            limitToLast(20)
        );

        // Listen to the query
        onValue(historyQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log("Historical data received:", data);
                processHistoricalData(data);
            } else {
                console.log("No historical data available");
            }
        }, (error) => {
            console.error("Error fetching historical data:", error);
        });
    }

    /**
     * Process historical data and convert to arrays for Chart.js
     * @param {Object} data - Raw data from Firebase snapshot
     */
    function processHistoricalData(data) {
        // Clear existing data
        dataHistory = {
            labels: [],
            temp: [], ph: [],
            tds: [], ec: [],
            turbidity: [], tss: [],
            hardness: [], chlorides: [],
            salinity: [], metals: []
        };

        // Convert object to array and sort by timestamp
        const dataArray = Object.entries(data).map(([key, value]) => ({
            key,
            ...value
        }));

        // Sort by timestamp (oldest first for chart)
        dataArray.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
                return new Date(a.timestamp) - new Date(b.timestamp);
            }
            return 0;
        });

        // Extract values into arrays
        dataArray.forEach(reading => {
            // Use timestamp or create time label from the reading
            const timeLabel = reading.timestamp 
                ? new Date(reading.timestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
                : 'Unknown';

            dataHistory.labels.push(timeLabel);
            dataHistory.ph.push(reading.ph || 0);
            dataHistory.tds.push(reading.tds || 0);
            dataHistory.turbidity.push(reading.turbidity || 0);
            dataHistory.ec.push(reading.ec || 0);
            dataHistory.temp.push(reading.temp || 0);
            dataHistory.hardness.push(reading.hardness || 0);
            dataHistory.chlorides.push(reading.chlorides || 0);
            dataHistory.tss.push(reading.tss || 0);
            dataHistory.salinity.push(reading.salinity || 0);
            dataHistory.metals.push(reading.metals || 0);
        });

        console.log("Processed data for charts:", dataHistory);
        
        // Update charts with historical data
        updateChartsWithHistory();
    }

    /**
     * Update Chart.js charts with historical data
     */
    function updateChartsWithHistory() {
        // Update each chart if it exists
        const charts = ['phTempChart', 'tdsEcChart', 'turbTssChart', 'hardChlorChart', 'salMetalsChart'];
        
        charts.forEach(chartId => {
            const chartElement = document.getElementById(chartId);
            if (chartElement && Chart.getChart(chartElement)) {
                const chart = Chart.getChart(chartElement);
                
                // Map chart ID to data fields
                let dataField1, dataField2;
                switch(chartId) {
                    case 'phTempChart':
                        dataField1 = 'ph';
                        dataField2 = 'temp';
                        break;
                    case 'tdsEcChart':
                        dataField1 = 'tds';
                        dataField2 = 'ec';
                        break;
                    case 'turbTssChart':
                        dataField1 = 'turbidity';
                        dataField2 = 'tss';
                        break;
                    case 'hardChlorChart':
                        dataField1 = 'hardness';
                        dataField2 = 'chlorides';
                        break;
                    case 'salMetalsChart':
                        dataField1 = 'salinity';
                        dataField2 = 'metals';
                        break;
                }
                
                if (dataField1 && dataField2) {
                    chart.data.labels = dataHistory.labels;
                    chart.data.datasets[0].data = dataHistory[dataField1];
                    chart.data.datasets[1].data = dataHistory[dataField2];
                    chart.update();
                }
            }
        });
    }

    // ==================== LIVE DATA ====================
    
    /**
     * Continue listening to live data for real-time dashboard updates
     */
    function listenToLiveData() {
        const liveRef = ref(database, 'sensors/water-quality');
        
        onValue(liveRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateDashboardUI(data);
                addToHistoryArrays(data);
            }
        });
    }

    /**
     * Add new live reading to history arrays
     */
    function addToHistoryArrays(data) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });

        dataHistory.labels.push(timeStr);
        dataHistory.ph.push(data.ph);
        dataHistory.tds.push(data.tds);
        dataHistory.turbidity.push(data.turbidity);
        dataHistory.ec.push(data.ec);
        dataHistory.temp.push(data.temp);
        dataHistory.hardness.push(data.hardness);
        dataHistory.chlorides.push(data.chlorides);
        dataHistory.tss.push(data.tss);
        dataHistory.salinity.push(data.salinity);
        dataHistory.metals.push(data.metals);

        // Keep only last 20 points
        if (dataHistory.labels.length > maxDataPoints) {
            dataHistory.labels.shift();
            dataHistory.ph.shift();
            dataHistory.tds.shift();
            dataHistory.turbidity.shift();
            dataHistory.ec.shift();
            dataHistory.temp.shift();
            dataHistory.hardness.shift();
            dataHistory.chlorides.shift();
            dataHistory.tss.shift();
            dataHistory.salinity.shift();
            dataHistory.metals.shift();
        }

        updateChartsWithHistory();
    }

    // ==================== DASHBOARD UI UPDATE ====================
    
    function updateDashboardUI(data) {
        if(document.getElementById("val-temp")) 
            document.getElementById("val-temp").innerText = data.temp + " °C";
        if(document.getElementById("val-ph")) 
            document.getElementById("val-ph").innerText = data.ph;
        if(document.getElementById("val-tds")) 
            document.getElementById("val-tds").innerText = data.tds + " PPM";
        if(document.getElementById("val-ec")) 
            document.getElementById("val-ec").innerText = data.ec + " S/M";
        if(document.getElementById("val-turbidity")) 
            document.getElementById("val-turbidity").innerText = data.turbidity + " NTU";
        if(document.getElementById("val-tss")) 
            document.getElementById("val-tss").innerText = data.tss + " PPM";
        if(document.getElementById("val-hardness")) 
            document.getElementById("val-hardness").innerText = data.hardness + " N/mm²";
        if(document.getElementById("val-chlorides")) 
            document.getElementById("val-chlorides").innerText = data.chlorides + " Mmol/L";
        if(document.getElementById("val-salinity")) 
            document.getElementById("val-salinity").innerText = data.salinity + " PPM";
        if(document.getElementById("val-metals")) 
            document.getElementById("val-metals").innerText = data.metals + " g/cm3";

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

        const overall = calculateOverallQuality(data);
        if(document.getElementById("val-quality")) 
            document.getElementById("val-quality").innerText = overall.text;
        updateStatus('quality', overall.status);
    }

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

    // ==================== INITIALIZATION ====================
    
    // Create charts
    createCharts();
    
    // Fetch historical data
    fetchHistoricalData();
    
    // Listen to live data
    listenToLiveData();

    function createCharts() {
        const phTempChart = createCombinedChart('phTempChart', 'pH', 'Temperature', '(0-14)', '(°C)');
        const tdsEcChart = createCombinedChart('tdsEcChart', 'TDS', 'EC', '(PPM)', '(S/M)');
        const turbTssChart = createCombinedChart('turbTssChart', 'Turbidity', 'TSS', '(NTU)', '(PPM)');
        const hardChlorChart = createCombinedChart('hardChlorChart', 'Hardness', 'Chlorides', '(N/mm²)', '(Mmol/L)');
        const salMetalsChart = createCombinedChart('salMetalsChart', 'Salinity', 'Heavy Metals', '(PPM)', '(g/cm³)');
    }

    function createCombinedChart(canvasId, label1, label2, unit1, unit2) {
        const ctx = document.getElementById(canvasId).getContext('2d');
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
                        }
                    },
                    y: {
                        type: 'linear', display: true, position: 'left',
                        title: { display: true, text: label1, color: 'rgba(255, 255, 255, 0.7)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right',
                        title: { display: true, text: label2, color: 'rgba(255, 255, 255, 0.7)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { drawOnChartArea: false } 
                    }
                }
            }
        });
    }
});

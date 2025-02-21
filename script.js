const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQEAl5IM4a7jpC8heq8feTrKD1lOE3bY2tgkATvgqR_qCqLYvSP65l1tcSsKao9l-LsM98auw4Vg_oh/pub?output=csv"";  // Replace with your Google Sheets CSV URL

let charts = {}; // Store chart instances to avoid duplication

async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const rows = text.split("\n").slice(1);
        const data = rows.map(row => row.split(","));

        let timestamps = [];
        let voltage = [], current = [], powerFactor = [], energy = [];

        data.forEach(row => {
            if (row.length > 5) {
                timestamps.push(new Date(row[0]).toLocaleTimeString());
                voltage.push(parseFloat(row[1]));
                current.push(parseFloat(row[2]));
                powerFactor.push(parseFloat(row[4]));
                energy.push(parseFloat(row[5]));
            }
        });

        updateCharts(timestamps, voltage, current, powerFactor, energy);
        checkAlerts(voltage, current, powerFactor);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function updateCharts(timestamps, voltage, current, powerFactor, energy) {
    createChart('voltageChart', 'Voltage (Vrms)', timestamps, voltage);
    createChart('currentChart', 'Current (Irms)', timestamps, current);
    createChart('powerFactorChart', 'Power Factor', timestamps, powerFactor);
    createChart('energyChart', 'Energy (kWh)', timestamps, energy);
}

function createChart(canvasId, label, labels, data) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Destroy previous chart if it exists
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    // Create a new chart and store it
    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: label, data: data, borderColor: 'blue', borderWidth: 2, fill: false }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function checkAlerts(voltage, current, powerFactor) {
    let alertMessage = "";
    if (Math.max(...current) > 10) alertMessage = "⚠️ High Current Detected!";
    if (Math.min(...powerFactor) < 0.8) alertMessage = "⚠️ Low Power Factor Warning!";

    document.getElementById("alert").innerText = alertMessage;
}

setInterval(fetchData, 10000); // Fetch data every 10 seconds
fetchData();

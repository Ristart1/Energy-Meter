const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQEAl5IM4a7jpC8heq8feTrKD1lOE3bY2tgkATvgqR_qCqLYvSP65l1tcSsKao9l-LsM98auw4Vg_oh/pub?output=csv";  // Replace with your Google Sheets CSV URL

let charts = {}; // Store chart instances to avoid duplication

async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        console.log("Raw CSV Data:", text); // Log the raw CSV data

        const rows = text.trim().split("\n").slice(1);  
        const data = rows.map(row => row.split(","));

        console.log("Parsed Data:", data); // Log parsed data

        let timestamps = [];
        let voltage = [], current = [], powerFactor = [], energy = [];

        data.forEach(row => {
            if (row.length > 5) {
                let rawTimestamp = row[0].trim(); // Example: "22/02/2025 00:56:38"
                
                // Convert "DD/MM/YYYY HH:MM:SS" to a valid JavaScript format
                let parts = rawTimestamp.split(" ");
                let dateParts = parts[0].split("/"); // ["22", "02", "2025"]
                let timePart = parts[1]; // "00:56:38"

                let formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timePart}`; // "2025-02-22T00:56:38"
                let validDate = new Date(formattedDate); 

                timestamps.push(validDate.toLocaleTimeString()); // Show only time on the graph

                voltage.push(parseFloat(row[1]));
                current.push(parseFloat(row[2]));
                powerFactor.push(parseFloat(row[4]));
                energy.push(parseFloat(row[5]));
            }
        });

        console.log("Processed Data:", { timestamps, voltage, current, powerFactor, energy }); // Log processed data

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

    // Ensure the canvas exists
    if (!canvas) {
        console.error(`Canvas with ID '${canvasId}' not found.`);
        return;
    }

    const ctx = canvas.getContext('2d');

    // Destroy previous chart instance if it exists
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    // Ensure data is valid before creating the chart
    if (data.length === 0 || labels.length === 0) {
        console.warn(`No data available for ${label}.`);
        return;
    }

    // Create and store the new chart
    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            animation: {
                duration: 0 // Disable animation to avoid flickering
            }
        }
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

// Existing constant for Google Sheets URL (with mode=fetch returning CSV data)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwgL_5t52LO4gzbHVgczfHhD8uB8MgYnE0wIgAVg6pBx2jFdzFIpLPEO9rahuEVQcGhFg/exec?mode=fetch";

// --- Existing fetchData function for real-time updates (unchanged) ---
async function fetchData() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const rows = text.trim().split("\n");
    if (rows.length < 2) {
      console.warn("No data available.");
      return;
    }
    const data = rows.slice(1).map(row => row.split(","));
    const latest = data[data.length - 1];  // last row (latest reading)

    // Update dashboard with latest values
    // Circuit 1
    document.getElementById("voltage1").innerText = latest[1];
    document.getElementById("current1").innerText = latest[2];
    document.getElementById("pf1").innerText      = latest[3];
    document.getElementById("power1").innerText   = latest[4];
    document.getElementById("energy1").innerText  = latest[5];
    // Circuit 2
    document.getElementById("voltage2").innerText = latest[1];
    document.getElementById("current2").innerText = latest[6];
    document.getElementById("pf2").innerText      = latest[7];
    document.getElementById("power2").innerText   = latest[8];
    document.getElementById("energy2").innerText  = latest[9];
    // Circuit 3
    document.getElementById("voltage3").innerText = latest[1];
    document.getElementById("current3").innerText = latest[10];
    document.getElementById("pf3").innerText      = latest[11];
    document.getElementById("power3").innerText   = latest[12];
    document.getElementById("energy3").innerText  = latest[13];
    // Circuit 4
    document.getElementById("voltage4").innerText = latest[1];
    document.getElementById("current4").innerText = latest[14];
    document.getElementById("pf4").innerText      = latest[15];
    document.getElementById("power4").innerText   = latest[16];
    document.getElementById("energy4").innerText  = latest[17];
    // Total consumption & cost
    document.getElementById("totalConsumption").innerText = latest[18];
    document.getElementById("cost").innerText             = "﷼" + latest[19];

    // Optional Alert for high current
    const currents = [
      parseFloat(latest[2]), parseFloat(latest[6]),
      parseFloat(latest[10]), parseFloat(latest[14])
    ];
    let alertMessage = "";
    if (currents.some(current => current > 10)) {
      alertMessage = "⚠️ High Current Detected!";
    }
    document.getElementById("alert").innerText = alertMessage;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Fetch latest data now and periodically (existing behavior)
fetchData();
setInterval(fetchData, 10000);  // fetch every 10 seconds (adjusted from 1000ms if needed)

// --- New Code for Period Report Feature ---

// Get references to modal elements and buttons
const modal       = document.getElementById("periodModal");
const openBtn     = document.getElementById("openReportBtn");
const closeBtn    = document.getElementById("closeModal");
const generateBtn = document.getElementById("generateReport");
const msgEl       = document.getElementById("reportMsg");

// Chart instances (to allow destruction before recreating)
let circuitChart = null;
let totalChart   = null;

/** Open the modal dialog */
openBtn.addEventListener("click", () => {
  modal.style.display = "flex";  // use flex to center content
  msgEl.innerText = "";          // clear any previous messages
});

/** Close the modal dialog (and optionally destroy charts to free memory) */
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  // Destroy charts if they exist to clean up
  if (circuitChart) { circuitChart.destroy(); circuitChart = null; }
  if (totalChart)   { totalChart.destroy(); totalChart = null; }
});

// Also close modal if user clicks outside the modal content (backdrop)
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
    if (circuitChart) { circuitChart.destroy(); circuitChart = null; }
    if (totalChart)   { totalChart.destroy(); totalChart = null; }
  }
});

/** Fetch all historical data from Google Sheets (CSV) and return as an array of objects. */
async function fetchHistoricalData() {
  const response = await fetch(SHEET_URL);
  const csvText = await response.text();
  const rows = csvText.trim().split("\n");
  if (rows.length < 2) {
    return [];  // no data available
  }
  const dataPoints = [];
  // Parse each row (skip header)
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(",");
    // Create an object for easier access
    // Parse numeric values and date
    const record = {
      date: new Date(cols[0]),               // Timestamp as Date object
      voltage: parseFloat(cols[1]),          // (if needed, not used in charts)
      current1: parseFloat(cols[2]),
      pf1: parseFloat(cols[3]),
      power1: parseFloat(cols[4]),
      energy1: parseFloat(cols[5]),
      current2: parseFloat(cols[6]),
      pf2: parseFloat(cols[7]),
      power2: parseFloat(cols[8]),
      energy2: parseFloat(cols[9]),
      current3: parseFloat(cols[10]),
      pf3: parseFloat(cols[11]),
      power3: parseFloat(cols[12]),
      energy3: parseFloat(cols[13]),
      current4: parseFloat(cols[14]),
      pf4: parseFloat(cols[15]),
      power4: parseFloat(cols[16]),
      energy4: parseFloat(cols[17]),
      totalEnergy: parseFloat(cols[18]),     // total_consumption (kWh)
      cost: parseFloat(cols[19])
    };
    dataPoints.push(record);
  }
  return dataPoints;
}

/** Filter data records to those within the [startDate, endDate] inclusive range. */
function filterDataByRange(data, startDate, endDate) {
  return data.filter(rec => {
    const t = rec.date.getTime();
    return t >= startDate.getTime() && t <= endDate.getTime();
  });
}

/** Generate the charts given filtered data */
function renderCharts(filteredData) {
  // Prepare labels (formatted dates) and datasets for Chart.js
  const labels = filteredData.map(rec => {
    // Format date for display (e.g., "YYYY-MM-DD HH:MM")
    const d = rec.date;
    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const mins  = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${mins}`;
  });
  // Data series for each circuit's energy (kWh)
  const dataC1 = filteredData.map(rec => rec.energy1);
  const dataC2 = filteredData.map(rec => rec.energy2);
  const dataC3 = filteredData.map(rec => rec.energy3);
  const dataC4 = filteredData.map(rec => rec.energy4);
  // Data series for total energy (kWh)
  const dataTotal = filteredData.map(rec => rec.totalEnergy);

  // Destroy existing charts if present (to avoid overlap)
  if (circuitChart) { circuitChart.destroy(); }
  if (totalChart)   { totalChart.destroy(); }

  // Create Chart.js line chart for circuits 1-4
  const ctx1 = document.getElementById("chartCircuits").getContext("2d");
  circuitChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Circuit 1 (kWh)', data: dataC1, borderColor: 'rgba(54,162,235,1)', backgroundColor: 'rgba(0,0,0,0)', fill: false },
        { label: 'Circuit 2 (kWh)', data: dataC2, borderColor: 'rgba(255,99,132,1)',  backgroundColor: 'rgba(0,0,0,0)', fill: false },
        { label: 'Circuit 3 (kWh)', data: dataC3, borderColor: 'rgba(75,192,192,1)',  backgroundColor: 'rgba(0,0,0,0)', fill: false },
        { label: 'Circuit 4 (kWh)', data: dataC4, borderColor: 'rgba(255,159,64,1)',  backgroundColor: 'rgba(0,0,0,0)', fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Consumption per Circuit'
        },
        legend: {
          display: true
        }
      },
      scales: {
        x: { 
          display: true, title: { display: true, text: 'Time' } 
        },
        y: { 
          display: true, title: { display: true, text: 'Energy (kWh)' } 
        }
      }
    }
  });

  // Create Chart.js line chart for total consumption
  const ctx2 = document.getElementById("chartTotal").getContext("2d");
  totalChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Total Consumption (kWh)', data: dataTotal, borderColor: 'rgba(153,102,255,1)', backgroundColor: 'rgba(0,0,0,0)', fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Total Energy Consumption'
        },
        legend: { display: false }  // single dataset, legend not needed
      },
      scales: {
        x: { 
          display: true, title: { display: true, text: 'Time' } 
        },
        y: { 
          display: true, title: { display: true, text: 'Energy (kWh)' } 
        }
      }
    }
  });
}

/** Compute and display summary metrics (peak, average, cost) for the filtered data. */
function renderSummary(filteredData, startDate, endDate) {
  const peakEl = document.getElementById("peakConsumption");
  const avgEl  = document.getElementById("avgConsumption");
  const costEl = document.getElementById("periodCost");

  if (filteredData.length === 0) {
    // No data in range
    peakEl.innerText = "--";
    avgEl.innerText  = "--";
    costEl.innerText = "--";
    return;
  }
  // Calculate total power at each timestamp by summing all circuit powers
  const totalPowerValues = filteredData.map(rec => rec.power1 + rec.power2 + rec.power3 + rec.power4);
  const peakPower = Math.max(...totalPowerValues);                       // peak instantaneous power (W)
  const avgPower = totalPowerValues.reduce((sum, val) => sum + val, 0) / totalPowerValues.length;  // average power (W)

  // Calculate total energy used in the period (kWh) using start/end readings
  const startTotalEnergy = filteredData[0].totalEnergy;
  const endTotalEnergy   = filteredData[filteredData.length - 1].totalEnergy;
  const totalEnergyUsed  = endTotalEnergy - startTotalEnergy;            // kWh used in period
  // Alternatively, sum of (energyN_end - energyN_start) for N=1..4 would yield the same.

  // Calculate total cost in period: difference between end and start cumulative cost
  const startCost = filteredData[0].cost;
  const endCost   = filteredData[filteredData.length - 1].cost;
  const periodCost = endCost - startCost;  // cost incurred in the range

  // Format the results
  const peakStr = `${peakPower.toFixed(1)} W`;           // one decimal place
  const avgStr  = `${avgPower.toFixed(1)} W`;
  const costStr = `﷼${periodCost.toFixed(2)}`;           // two decimal places with currency symbol

  peakEl.innerText = peakStr;
  avgEl.innerText  = avgStr;
  costEl.innerText = costStr;
}

// Event handler for the Generate Report button
generateBtn.addEventListener("click", async () => {
  // Get selected dates
  const startVal = document.getElementById("startDate").value;
  const endVal   = document.getElementById("endDate").value;
  if (!startVal || !endVal) {
    msgEl.innerText = "Please select a start and end date.";
    return;
  }
  const startDate = new Date(startVal);
  // To include the entire end day, set end time to end-of-day
  let endDate = new Date(endVal);
  endDate.setHours(23, 59, 59, 999);

  if (startDate > endDate) {
    msgEl.innerText = "Start date must be before end date.";
    return;
  }

  try {
    // Fetch all data and filter by range
    const allData = await fetchHistoricalData();
    const filteredData = filterDataByRange(allData, startDate, endDate);
    if (filteredData.length === 0) {
      msgEl.innerText = "No data available for the selected period.";
      // Clear any existing charts and summary if present
      if (circuitChart) { circuitChart.destroy(); circuitChart = null; }
      if (totalChart)   { totalChart.destroy(); totalChart = null; }
      renderSummary([], startDate, endDate);
      return;
    }
    msgEl.innerText = "";  // clear any previous message

    // Render charts and summary
    renderCharts(filteredData);
    renderSummary(filteredData, startDate, endDate);
  } catch (error) {
    console.error("Error generating period report:", error);
    msgEl.innerText = "Failed to load data. Please try again.";
  }
});

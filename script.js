// Existing constant for Google Sheets URL (with mode=fetch returning CSV data)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwgL_5t52LO4gzbHVgczfHhD8uB8MgYnE0wIgAVg6pBx2jFdzFIpLPEO9rahuEVQcGhFg/exec?mode=fetch";

// --- Real-time fetchData (unchanged) ---
async function fetchData() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const rows = text.trim().split("\n");
    if (rows.length < 2) return;
    const data = rows.slice(1).map(r => r.split(","));
    const latest = data[data.length - 1];

    // Update dashboard...
    document.getElementById("voltage1").innerText = latest[1];
    document.getElementById("current1").innerText = latest[2];
    document.getElementById("pf1").innerText      = latest[3];
    document.getElementById("power1").innerText   = latest[4];
    document.getElementById("energy1").innerText  = latest[5];

    document.getElementById("voltage2").innerText = latest[1];
    document.getElementById("current2").innerText = latest[6];
    document.getElementById("pf2").innerText      = latest[7];
    document.getElementById("power2").innerText   = latest[8];
    document.getElementById("energy2").innerText  = latest[9];

    document.getElementById("voltage3").innerText = latest[1];
    document.getElementById("current3").innerText = latest[10];
    document.getElementById("pf3").innerText      = latest[11];
    document.getElementById("power3").innerText   = latest[12];
    document.getElementById("energy3").innerText  = latest[13];

    document.getElementById("voltage4").innerText = latest[1];
    document.getElementById("current4").innerText = latest[14];
    document.getElementById("pf4").innerText      = latest[15];
    document.getElementById("power4").innerText   = latest[16];
    document.getElementById("energy4").innerText  = latest[17];

    document.getElementById("totalConsumption").innerText = latest[18];
    document.getElementById("cost").innerText             = "﷼" + latest[19];

    // High-current alert
    const currents = [latest[2], latest[6], latest[10], latest[14]].map(parseFloat);
    document.getElementById("alert").innerText =
      currents.some(c => c > 10) ? "⚠️ High Current Detected!" : "";
  } catch (e) {
    console.error("Error fetching data:", e);
  }
}

fetchData();
setInterval(fetchData, 10000);

// --- Period Report Code ---

const modal       = document.getElementById("periodModal");
const openBtn     = document.getElementById("openReportBtn");
const closeBtn    = document.getElementById("closeModal");
const generateBtn = document.getElementById("generateReport");
const msgEl       = document.getElementById("reportMsg");
let circuitChart = null;
let totalChart   = null;

openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  msgEl.innerText = "";
});
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", e => (e.target === modal) && closeModal());

function closeModal() {
  modal.style.display = "none";
  if (circuitChart) { circuitChart.destroy(); circuitChart = null; }
  if (totalChart)   { totalChart.destroy(); totalChart = null; }
}

async function fetchHistoricalData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = text.trim().split("\n");
  if (rows.length < 2) return [];
  return rows.slice(1).map(line => {
    const c = line.split(",");
    return {
      date: new Date(c[0]),
      energy1: parseFloat(c[5]),
      energy2: parseFloat(c[9]),
      energy3: parseFloat(c[13]),
      energy4: parseFloat(c[17]),
      power1: parseFloat(c[4]),
      power2: parseFloat(c[8]),
      power3: parseFloat(c[12]),
      power4: parseFloat(c[16])
    };
  });
}

function filterData(data, start, end) {
  return data.filter(r => r.date >= start && r.date <= end);
}

function renderCharts(data) {
  const labels = data.map(r => {
    const d = r.date;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  });
  const d1 = data.map(r => r.energy1);
  const d2 = data.map(r => r.energy2);
  const d3 = data.map(r => r.energy3);
  const d4 = data.map(r => r.energy4);

  if (circuitChart) circuitChart.destroy();
  const ctx1 = document.getElementById("chartCircuits").getContext("2d");
  circuitChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Circuit 1 (kWh)', data: d1, borderColor: 'rgba(54,162,235,1)', fill: false },
        { label: 'Circuit 2 (kWh)', data: d2, borderColor: 'rgba(255,99,132,1)', fill: false },
        { label: 'Circuit 3 (kWh)', data: d3, borderColor: 'rgba(75,192,192,1)', fill: false },
        { label: 'Circuit 4 (kWh)', data: d4, borderColor: 'rgba(255,159,64,1)', fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Energy Consumption per Circuit' } },
      scales: { x: { title: { display: true, text: 'Time' } }, y: { title: { display: true, text: 'Energy (kWh)' } } }
    }
  });

  if (totalChart) totalChart.destroy();
  const ctx2 = document.getElementById("chartTotal").getContext("2d");
  totalChart = new Chart(ctx2, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Total Consumption (kWh)', data: d1.map((_,i)=>d1[i]+d2[i]+d3[i]+d4[i]), borderColor: 'rgba(153,102,255,1)', fill: false }] },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Total Energy Consumption' } },
      scales: { x: { title: { display: true, text: 'Time' } }, y: { title: { display: true, text: 'Energy (kWh)' } } }
    }
  });
}

function renderSummary(data) {
  const peakEl = document.getElementById("peakConsumption");
  const avgEl  = document.getElementById("avgConsumption");

  if (!data.length) {
    peakEl.innerText = "--";
    avgEl.innerText  = "--";
    return;
  }
  const totalP = data.map(r => r.power1 + r.power2 + r.power3 + r.power4);
  const peak  = Math.max(...totalP);
  const avg   = totalP.reduce((a,b)=>a+b,0) / totalP.length;

  peakEl.innerText = `${peak.toFixed(1)} W`;
  avgEl.innerText  = `${avg.toFixed(1)} W`;
}

generateBtn.addEventListener("click", async () => {
  const sv = document.getElementById("startDate").value;
  const ev = document.getElementById("endDate").value;
  if (!sv || !ev) return msgEl.innerText = "Please select both dates.";
  const start = new Date(sv);
  const end   = new Date(ev);
  end.setHours(23,59,59,999);
  if (start > end) return msgEl.innerText = "Start must precede end.";

  const allData = await fetchHistoricalData();
  const fd = filterData(allData, start, end);
  if (!fd.length) {
    closeModal();
    return msgEl.innerText = "No data in that range.";
  }
  msgEl.innerText = "";
  renderCharts(fd);
  renderSummary(fd);
});

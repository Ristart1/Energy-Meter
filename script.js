// Google Sheets fetch URL
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwgL_5t52LO4gzbHVgczfHhD8uB8MgYnE0wIgAVg6pBx2jFdzFIpLPEO9rahuEVQcGhFg/exec?mode=fetch";

// --- Real-time dashboard update (unchanged) ---
async function fetchData() {
  try {
    const res = await fetch(SHEET_URL);
    const txt = await res.text();
    const rows = txt.trim().split("\n");
    if (rows.length < 2) return;
    const latest = rows.slice(1).map(r => r.split(",")).pop();

    // Update your 4 circuits + total consumption & cost as before…
    // (omitted here for brevity)
  } catch (e) {
    console.error(e);
  }
}
fetchData();
setInterval(fetchData, 10000);

// --- Period Report Modal Logic ---
const modal       = document.getElementById("periodModal");
const openBtn     = document.getElementById("openReportBtn");
const closeBtn    = document.getElementById("closeModal");
const generateBtn = document.getElementById("generateReport");
const msgEl       = document.getElementById("reportMsg");
let circuitChart = null, totalChart = null;

openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  msgEl.innerText = "";
});
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", e => { if (e.target === modal) closeModal(); });

function closeModal() {
  modal.style.display = "none";
  if (circuitChart) { circuitChart.destroy(); circuitChart = null; }
  if (totalChart)   { totalChart.destroy(); totalChart = null; }
}

// Fetch all rows as array of records
async function fetchHistoricalData() {
  const res = await fetch(SHEET_URL);
  const txt = await res.text();
  const rows = txt.trim().split("\n");
  if (rows.length < 2) return [];
  return rows.slice(1).map(line => {
    const c = line.split(",");
    return {
      date:    new Date(c[0]),
      energy1: parseFloat(c[5]),
      energy2: parseFloat(c[9]),
      energy3: parseFloat(c[13]),
      energy4: parseFloat(c[17]),
      power1:  parseFloat(c[4]),
      power2:  parseFloat(c[8]),
      power3:  parseFloat(c[12]),
      power4:  parseFloat(c[16])
    };
  });
}

// Utility to format date/time
function formatDate(d) {
  const Y = d.getFullYear();
  const M = String(d.getMonth()+1).padStart(2,"0");
  const D = String(d.getDate()).padStart(2,"0");
  const h = String(d.getHours()).padStart(2,"0");
  const m = String(d.getMinutes()).padStart(2,"0");
  return `${Y}-${M}-${D} ${h}:${m}`;
}

// Filter by inclusive date range
function filterData(data, start, end) {
  return data.filter(r => r.date >= start && r.date <= end);
}

// Draw the two line charts (per circuit energies & total)
function renderCharts(data) {
  const labels = data.map(r => formatDate(r.date));
  const e1 = data.map(r => r.energy1);
  const e2 = data.map(r => r.energy2);
  const e3 = data.map(r => r.energy3);
  const e4 = data.map(r => r.energy4);

  if (circuitChart) circuitChart.destroy();
  const ctx1 = document.getElementById("chartCircuits").getContext("2d");
  circuitChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label:'Circuit 1 (kWh)', data:e1, borderColor:'rgba(54,162,235,1)', fill:false },
        { label:'Circuit 2 (kWh)', data:e2, borderColor:'rgba(255,99,132,1)', fill:false },
        { label:'Circuit 3 (kWh)', data:e3, borderColor:'rgba(75,192,192,1)', fill:false },
        { label:'Circuit 4 (kWh)', data:e4, borderColor:'rgba(255,159,64,1)', fill:false }
      ]
    },
    options: {
      responsive:true,
      plugins:{ title:{ display:true, text:'Energy Consumption per Circuit' } },
      scales:{ x:{ title:{ display:true, text:'Time' } }, y:{ title:{ display:true, text:'Energy (kWh)' } } }
    }
  });

  if (totalChart) totalChart.destroy();
  const ctx2 = document.getElementById("chartTotal").getContext("2d");
  // Sum of the 4 energies at each point for total line
  const totalE = e1.map((_,i) => e1[i]+e2[i]+e3[i]+e4[i]);
  totalChart = new Chart(ctx2, {
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Total Consumption (kWh)',
        data: totalE,
        borderColor:'rgba(153,102,255,1)',
        fill:false
      }]
    },
    options:{
      responsive:true,
      plugins:{ title:{ display:true, text:'Total Energy Consumption' } },
      scales:{ x:{ title:{ display:true, text:'Time' } }, y:{ title:{ display:true, text:'Energy (kWh)' } } }
    }
  });
}

// Compute per-circuit peaks and average power
function renderSummary(data) {
  // Find record with max energy for each circuit
  const peak1 = data.reduce((m,r)=> r.energy1>m.energy1?r:m, data[0]);
  const peak2 = data.reduce((m,r)=> r.energy2>m.energy2?r:m, data[0]);
  const peak3 = data.reduce((m,r)=> r.energy3>m.energy3?r:m, data[0]);
  const peak4 = data.reduce((m,r)=> r.energy4>m.energy4?r:m, data[0]);

  // Average total power (W)
  const powers = data.map(r => r.power1 + r.power2 + r.power3 + r.power4);
  const avgP = powers.reduce((a,b)=>a+b,0) / powers.length;

  // Populate DOM
  document.getElementById("peak1Value").innerText = peak1.energy1.toFixed(3);
  document.getElementById("peak1Time").innerText  = formatDate(peak1.date);
  document.getElementById("peak2Value").innerText = peak2.energy2.toFixed(3);
  document.getElementById("peak2Time").innerText  = formatDate(peak2.date);
  document.getElementById("peak3Value").innerText = peak3.energy3.toFixed(3);
  document.getElementById("peak3Time").innerText  = formatDate(peak3.date);
  document.getElementById("peak4Value").innerText = peak4.energy4.toFixed(3);
  document.getElementById("peak4Time").innerText  = formatDate(peak4.date);

  document.getElementById("avgConsumption").innerText = `${avgP.toFixed(1)} W`;
}

// Handle Generate Report click
generateBtn.addEventListener("click", async () => {
  const sv = document.getElementById("startDate").value;
  const ev = document.getElementById("endDate").value;
  msgEl.innerText = "";
  if (!sv || !ev) return msgEl.innerText = "Select both dates.";
  const start = new Date(sv), end = new Date(ev);
  end.setHours(23,59,59,999);
  if (start > end) return msgEl.innerText = "Start date must come first.";

  const allData = await fetchHistoricalData();
  const fd = filterData(allData, start, end);
  if (!fd.length) {
    msgEl.innerText = "No data in that period.";
    return;
  }

  renderCharts(fd);
  renderSummary(fd);
});

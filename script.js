// URL for Google Apps Script (CSV mode)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwgL_5t52LO4gzbHVgczfHhD8uB8MgYnE0wIgAVg6pBx2jFdzFIpLPEO9rahuEVQcGhFg/exec?mode=fetch";

// === Real-time Dashboard Update ===
async function fetchData() {
  try {
    const res   = await fetch(SHEET_URL);
    const text  = await res.text();
    const rows  = text.trim().split("\n");
    if (rows.length < 2) return;
    // Parse CSV rows into arrays
    const data  = rows.slice(1).map(r => r.split(","));
    const latest = data[data.length - 1];

    // Update Circuit 1
    document.getElementById("voltage1").innerText = latest[1];
    document.getElementById("current1").innerText = latest[2];
    document.getElementById("pf1")     .innerText = latest[3];
    document.getElementById("power1")  .innerText = latest[4];
    document.getElementById("energy1") .innerText = latest[5];

    // Circuit 2
    document.getElementById("voltage2").innerText = latest[1];
    document.getElementById("current2").innerText = latest[6];
    document.getElementById("pf2")     .innerText = latest[7];
    document.getElementById("power2")  .innerText = latest[8];
    document.getElementById("energy2") .innerText = latest[9];

    // Circuit 3
    document.getElementById("voltage3").innerText = latest[1];
    document.getElementById("current3").innerText = latest[10];
    document.getElementById("pf3")     .innerText = latest[11];
    document.getElementById("power3")  .innerText = latest[12];
    document.getElementById("energy3") .innerText = latest[13];

    // Circuit 4
    document.getElementById("voltage4").innerText = latest[1];
    document.getElementById("current4").innerText = latest[14];
    document.getElementById("pf4")     .innerText = latest[15];
    document.getElementById("power4")  .innerText = latest[16];
    document.getElementById("energy4") .innerText = latest[17];

    // Total consumption & cost
    document.getElementById("totalConsumption").innerText = latest[18];
    document.getElementById("cost")            .innerText = "﷼" + latest[19];

   

    // Per-circuit warnings at ≥ 4 A ===
    globalCurrents.forEach((val, idx) => {
      const warnEl = document.getElementById(`warn${idx+1}`);
      warnEl.innerText = (val >= 2) ? "High Current is detected" : "";
    });

  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// Initial fetch & periodic updates
fetchData();
setInterval(fetchData, 10000);

// === Period Report Modal Logic ===
const modal       = document.getElementById("periodModal");
const openBtn     = document.getElementById("openReportBtn");
const closeBtn    = document.getElementById("closeModal");
const generateBtn = document.getElementById("generateReport");
const msgEl       = document.getElementById("reportMsg");
let circuitChart = null, totalChart = null;

// Open modal
openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  msgEl.innerText = "";
});
// Close modal
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});
function closeModal() {
  modal.style.display = "none";
  circuitChart?.destroy();
  totalChart?.destroy();
}

// Fetch all historical data as array of records
async function fetchHistoricalData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = text.trim().split("\n");
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

// Helper: format Date → "YYYY-MM-DD HH:MM"
function formatDate(d) {
  const Y = d.getFullYear(),
        M = String(d.getMonth()+1).padStart(2,"0"),
        D = String(d.getDate()).padStart(2,"0"),
        h = String(d.getHours()).padStart(2,"0"),
        m = String(d.getMinutes()).padStart(2,"0");
  return `${Y}-${M}-${D} ${h}:${m}`;
}

// Filter by inclusive date range
function filterData(data, start, end) {
  return data.filter(r => r.date >= start && r.date <= end);
}

// Render the two line charts
function renderCharts(data) {
  const labels = data.map(r => formatDate(r.date));
  const e1 = data.map(r => r.energy1),
        e2 = data.map(r => r.energy2),
        e3 = data.map(r => r.energy3),
        e4 = data.map(r => r.energy4);

  circuitChart?.destroy();
  circuitChart = new Chart(
    document.getElementById("chartCircuits").getContext("2d"), {
      type: 'line',
      data: { labels, datasets:[
        { label:'Circuit 1 (kWh)', data:e1, borderColor:'rgba(54,162,235,1)', fill:false },
        { label:'Circuit 2 (kWh)', data:e2, borderColor:'rgba(255,99,132,1)', fill:false },
        { label:'Circuit 3 (kWh)', data:e3, borderColor:'rgba(75,192,192,1)', fill:false },
        { label:'Circuit 4 (kWh)', data:e4, borderColor:'rgba(255,159,64,1)', fill:false }
      ]},
      options:{
        responsive:true,
        plugins:{ title:{ display:true, text:'Energy Consumption per Circuit' } },
        scales:{
          x:{ title:{ display:true, text:'Time' } },
          y:{ title:{ display:true, text:'Energy (kWh)' } }
        }
      }
    }
  );

  totalChart?.destroy();
  const totalE = e1.map((_,i) => e1[i]+e2[i]+e3[i]+e4[i]);
  totalChart = new Chart(
    document.getElementById("chartTotal").getContext("2d"), {
      type:'line',
      data:{ labels, datasets:[
        { label:'Total Consumption (kWh)', data:totalE, borderColor:'rgba(153,102,255,1)', fill:false }
      ]},
      options:{
        responsive:true,
        plugins:{ title:{ display:true, text:'Total Energy Consumption' } },
        scales:{
          x:{ title:{ display:true, text:'Time' } },
          y:{ title:{ display:true, text:'Energy (kWh)' } }
        }
      }
    }
  );
}

// Render per-circuit peaks
function renderSummary(data) {
  const peak1 = data.reduce((m,r)=>r.energy1>m.energy1?r:m, data[0]);
  const peak2 = data.reduce((m,r)=>r.energy2>m.energy2?r:m, data[0]);
  const peak3 = data.reduce((m,r)=>r.energy3>m.energy3?r:m, data[0]);
  const peak4 = data.reduce((m,r)=>r.energy4>m.energy4?r:m, data[0]);

  document.getElementById("peak1Value").innerText = peak1.energy1.toFixed(3);
  document.getElementById("peak1Time") .innerText = formatDate(peak1.date);
  document.getElementById("peak2Value").innerText = peak2.energy2.toFixed(3);
  document.getElementById("peak2Time") .innerText = formatDate(peak2.date);
  document.getElementById("peak3Value").innerText = peak3.energy3.toFixed(3);
  document.getElementById("peak3Time") .innerText = formatDate(peak3.date);
  document.getElementById("peak4Value").innerText = peak4.energy4.toFixed(3);
  document.getElementById("peak4Time") .innerText = formatDate(peak4.date);
}

// Generate the period report
generateBtn.addEventListener("click", async () => {
  const sv = document.getElementById("startDate").value,
        ev = document.getElementById("endDate").value;
  msgEl.innerText = "";
  if (!sv || !ev) {
    msgEl.innerText = "Please select both dates.";
    return;
  }
  const start = new Date(sv), end = new Date(ev);
  end.setHours(23,59,59,999);
  if (start > end) {
    msgEl.innerText = "Start date must come first.";
    return;
  }

  const allData = await fetchHistoricalData();
  const fd = filterData(allData, start, end);
  if (!fd.length) {
    msgEl.innerText = "No data in that period.";
    return;
  }

  renderCharts(fd);
  renderSummary(fd);
});

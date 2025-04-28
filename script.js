const SHEET_URL = "https://script.google.com/macros/s/AKfycbwgL_5t52LO4gzbHVgczfHhD8uB8MgYnE0wIgAVg6pBx2jFdzFIpLPEO9rahuEVQcGhFg/exec?mode=fetch";

// Real-time update (unchanged) ...
async function fetchData() {
  try {
    const res = await fetch(SHEET_URL);
    const rows = (await res.text()).trim().split("\n");
    if (rows.length < 2) return;
    const latest = rows.slice(1).map(r => r.split(",")).pop();
    // ... update dashboard elements ...
  } catch (e) {
    console.error(e);
  }
}
fetchData();
setInterval(fetchData, 10000);

// Modal controls
const modal       = document.getElementById("periodModal");
const openBtn     = document.getElementById("openReportBtn");
const closeBtn    = document.getElementById("closeModal");
const generateBtn = document.getElementById("generateReport");
const msgEl       = document.getElementById("reportMsg");
let circuitChart, totalChart;

openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  msgEl.innerText = "";
});
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", e => { if (e.target === modal) closeModal(); });

function closeModal() {
  modal.style.display = "none";
  circuitChart?.destroy();
  totalChart?.destroy();
}

// Fetch and parse historical data
async function fetchHistoricalData() {
  const res = await fetch(SHEET_URL);
  const rows = (await res.text()).trim().split("\n");
  if (rows.length < 2) return [];
  return rows.slice(1).map(line => {
    const c = line.split(",");
    return {
      date:    new Date(c[0]),
      energy1: +c[5],
      energy2: +c[9],
      energy3: +c[13],
      energy4: +c[17],
      power1:  +c[4],
      power2:  +c[8],
      power3:  +c[12],
      power4:  +c[16]
    };
  });
}

function formatDate(d) {
  const Y = d.getFullYear(),
        M = String(d.getMonth()+1).padStart(2,"0"),
        D = String(d.getDate()).padStart(2,"0"),
        h = String(d.getHours()).padStart(2,"0"),
        m = String(d.getMinutes()).padStart(2,"0");
  return `${Y}-${M}-${D} ${h}:${m}`;
}

function filterData(data, start, end) {
  return data.filter(r => r.date >= start && r.date <= end);
}

// Charts
function renderCharts(data) {
  const labels = data.map(r => formatDate(r.date));
  const e1 = data.map(r => r.energy1),
        e2 = data.map(r => r.energy2),
        e3 = data.map(r => r.energy3),
        e4 = data.map(r => r.energy4);

  circuitChart?.destroy();
  totalChart?.destroy();

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
        scales:{ x:{ title:{ display:true, text:'Time' } }, y:{ title:{ display:true, text:'Energy (kWh)' } } }
      }
    }
  );

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
        scales:{ x:{ title:{ display:true, text:'Time' } }, y:{ title:{ display:true, text:'Energy (kWh)' } } }
      }
    }
  );
}

// Summary: per-circuit peaks only
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

// Generate report
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

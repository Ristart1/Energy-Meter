// Replace with your deployed Google Apps Script URL including ?mode=fetch
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwgL_5t52LO4gzbHVgczfHhD8uB8MgYnE0wIgAVg6pBx2jFdzFIpLPEO9rahuEVQcGhFg/exec?mode=fetch";

async function fetchData() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const rows = text.trim().split("\n");
    if (rows.length < 2) {
      console.warn("No data available.");
      return;
    }
    // Remove header row, get the latest row
    const data = rows.slice(1).map(row => row.split(","));
    const latest = data[data.length - 1];

    // Column indices in your CSV:
    // 0: Timestamp
    // 1: Voltage
    // 2: current1, 3: pf1, 4: power1, 5: kWh1
    // 6: current2, 7: pf2, 8: power2, 9: kWh2
    // 10: current3, 11: pf3, 12: power3, 13: kWh3
    // 14: current4, 15: pf4, 16: power4, 17: kWh4
    // 18: total_consumption, 19: cost

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

    // Optional Alert
    const currents = [
      parseFloat(latest[2]),
      parseFloat(latest[6]),
      parseFloat(latest[10]),
      parseFloat(latest[14])
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

// Fetch data now and then every 10 seconds
fetchData();
setInterval(fetchData, 1000);

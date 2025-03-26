// Replace the URL below with your own deployed Google Apps Script URL
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwgL_5t52LO4gzbHVgczfHhD8uB8MgYnE0wIgAVg6pBx2jFdzFIpLPEO9rahuEVQcGhFg/exec?mode=fetch";

async function fetchData() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    // Split CSV data into rows (first row assumed to be header)
    const rows = text.trim().split("\n");
    if (rows.length < 2) {
      console.warn("No data available.");
      return;
    }
    // Remove header and get the latest row
    const data = rows.slice(1).map(row => row.split(","));
    const latest = data[data.length - 1];

    // Expected column indices:
    // 0: Timestamp
    // 1: Voltage
    // 2: current1, 3: pf1, 4: power1, 5: kWh1
    // 6: current2, 7: pf2, 8: power2, 9: kWh2
    // 10: current3, 11: pf3, 12: power3, 13: kWh3
    // 14: current4, 15: pf4, 16: power4, 17: kWh4
    // 18: total_consumption, 19: cost

    // Update Circuit 1
    document.getElementById("current1").innerText = latest[2] + " A";
    document.getElementById("pf1").innerText = latest[3];
    document.getElementById("power1").innerText = latest[4] + " W";
    document.getElementById("energy1").innerText = latest[5] + " kWh";

    // Update Circuit 2
    document.getElementById("current2").innerText = latest[6] + " A";
    document.getElementById("pf2").innerText = latest[7];
    document.getElementById("power2").innerText = latest[8] + " W";
    document.getElementById("energy2").innerText = latest[9] + " kWh";

    // Update Circuit 3
    document.getElementById("current3").innerText = latest[10] + " A";
    document.getElementById("pf3").innerText = latest[11];
    document.getElementById("power3").innerText = latest[12] + " W";
    document.getElementById("energy3").innerText = latest[13] + " kWh";

    // Update Circuit 4
    document.getElementById("current4").innerText = latest[14] + " A";
    document.getElementById("pf4").innerText = latest[15];
    document.getElementById("power4").innerText = latest[16] + " W";
    document.getElementById("energy4").innerText = latest[17] + " kWh";

    // Update Total Consumption and Cost (Square 5)
    document.getElementById("totalConsumption").innerText = latest[18] + " kWh";
    document.getElementById("cost").innerText = "$" + latest[19];

    // Optional: Check for alerts (example: any circuit current > 10 A)
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

// Fetch data immediately and then every 10 seconds
fetchData();
setInterval(fetchData, 10000);

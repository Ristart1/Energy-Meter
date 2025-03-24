// Replace with your published CSV link from Google Sheets
// Example: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0'
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEAl5IM4a7jpC8heq8feTrKD1lOE3bY2tgkATvgqR_qCqLYvSP65l1tcSsKao9l-LsM98auw4Vg_oh/pub?output=csv';

function fetchAndDisplayData() {
  // Append a timestamp to bypass caching
  const noCacheUrl = csvUrl + '&t=' + new Date().getTime();
  
  fetch(noCacheUrl)
    .then(response => response.text())
    .then(csv => {
      // Split CSV text into rows and map each row to an array of columns
      const rows = csv.trim().split('\n').map(row => row.split(','));
      
      // Filter out any rows where the timestamp (column 0) is empty
      const validRows = rows.filter(row => row[0] && row[0].trim() !== "");
      
      if (validRows.length === 0) {
        console.error('No valid data rows found.');
        return;
      }
      
      // The last row in the filtered array is the latest valid row
      const lastRow = validRows[validRows.length - 1];
      
      // Assuming columns are ordered as:
      // 0 = Timestamp, 1 = Voltage, 2 = Current1, 3 = PF1, 4 = Power1, 5 = kWh1,
      // 6 = Current2, 7 = PF2, 8 = Power2, 9 = kWh2,
      // 10 = Current3, 11 = PF3, 12 = Power3, 13 = kWh3,
      // 14 = Current4, 15 = PF4, 16 = Power4, 17 = kWh4,
      // 18 = TotalConsumption, 19 = Cost

      const voltage  = lastRow[1];
      const current1 = lastRow[2];
      const pf1      = lastRow[3];
      const power1   = lastRow[4];
      const kWh1     = lastRow[5];

      const current2 = lastRow[6];
      const pf2      = lastRow[7];
      const power2   = lastRow[8];
      const kWh2     = lastRow[9];

      const current3 = lastRow[10];
      const pf3      = lastRow[11];
      const power3   = lastRow[12];
      const kWh3     = lastRow[13];

      const current4 = lastRow[14];
      const pf4      = lastRow[15];
      const power4   = lastRow[16];
      const kWh4     = lastRow[17];

      const totalConsumption = lastRow[18];
      const cost             = lastRow[19];

      // Update each circuit's display with the voltage added
      document.getElementById('circuit1-data').innerHTML = `
        <p>Voltage: ${voltage}</p>
        <p>Current: ${current1}</p>
        <p>PF: ${pf1}</p>
        <p>Power: ${power1}</p>
        <p>kWh: ${kWh1}</p>
      `;
      document.getElementById('circuit2-data').innerHTML = `
        <p>Voltage: ${voltage}</p>
        <p>Current: ${current2}</p>
        <p>PF: ${pf2}</p>
        <p>Power: ${power2}</p>
        <p>kWh: ${kWh2}</p>
      `;
      document.getElementById('circuit3-data').innerHTML = `
        <p>Voltage: ${voltage}</p>
        <p>Current: ${current3}</p>
        <p>PF: ${pf3}</p>
        <p>Power: ${power3}</p>
        <p>kWh: ${kWh3}</p>
      `;
      document.getElementById('circuit4-data').innerHTML = `
        <p>Voltage: ${voltage}</p>
        <p>Current: ${current4}</p>
        <p>PF: ${pf4}</p>
        <p>Power: ${power4}</p>
        <p>kWh: ${kWh4}</p>
      `;
      document.getElementById('total-data').innerHTML = `
        <p>Consumption: ${totalConsumption}</p>
        <p>Cost: ${cost}</p>
      `;
    })
    .catch(error => {
      console.error('Error fetching CSV data:', error);
    });
}

// Fetch immediately, then again every 1 second
fetchAndDisplayData();
setInterval(fetchAndDisplayData, 1000);

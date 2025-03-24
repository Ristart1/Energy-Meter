// Replace with your published CSV link from Google Sheets
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEAl5IM4a7jpC8heq8feTrKD1lOE3bY2tgkATvgqR_qCqLYvSP65l1tcSsKao9l-LsM98auw4Vg_oh/pub?output=csv';

fetch(csvUrl)
  .then(response => response.text())
  .then(csv => {
    // Convert CSV text into an array of rows
    const rows = csv.trim().split('\n').map(row => row.split(','));
    
    // The first row is the header, so we take the last row as the latest data
    const lastRow = rows[rows.length - 1];

    // Assuming your sheet columns are in the following order:
    // A=Timestamp(0), B=Voltage(1), C=Current1(2), D=PF1(3), E=Power1(4), F=kWh1(5),
    // G=Current2(6), H=PF2(7), I=Power2(8), J=kWh2(9),
    // K=Current3(10), L=PF3(11), M=Power3(12), N=kWh3(13),
    // O=Current4(14), P=PF4(15), Q=Power4(16), R=kWh4(17),
    // S=TotalConsumption(18), T=Cost(19)

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

    // Update HTML for each circuit and total
    document.getElementById('circuit1-data').innerHTML = `
      <p>Current: ${current1}</p>
      <p>PF: ${pf1}</p>
      <p>Power: ${power1}</p>
      <p>kWh: ${kWh1}</p>
    `;
    document.getElementById('circuit2-data').innerHTML = `
      <p>Current: ${current2}</p>
      <p>PF: ${pf2}</p>
      <p>Power: ${power2}</p>
      <p>kWh: ${kWh2}</p>
    `;
    document.getElementById('circuit3-data').innerHTML = `
      <p>Current: ${current3}</p>
      <p>PF: ${pf3}</p>
      <p>Power: ${power3}</p>
      <p>kWh: ${kWh3}</p>
    `;
    document.getElementById('circuit4-data').innerHTML = `
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

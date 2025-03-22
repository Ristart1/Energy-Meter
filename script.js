// Google Sheets settings – replace with your Sheet ID and sheet name (or gid if needed)
const sheetId = "11axXh3cyf_28UUOGtrcx3B-E7kTxm9YXGwial6erdvE";
const sheetName = "Sheet1";  // Adjust to your sheet's name
const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&headers=1`;

// Load Google Charts package
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(initDashboard);

let dataTable;               // will hold Google Sheets data as a DataTable
let chartLine, chartBar, chartPie;  // chart objects

function initDashboard() {
  // Initialize chart objects (linked to divs in HTML)
  chartLine = new google.visualization.LineChart(document.getElementById('chart_line'));
  chartBar  = new google.visualization.ColumnChart(document.getElementById('chart_bar'));
  chartPie  = new google.visualization.PieChart(document.getElementById('chart_pie'));
  
  // Set up event handlers for range selection
  const rangeSelect = document.getElementById('time-range');
  const customControls = document.getElementById('custom-range-controls');
  rangeSelect.addEventListener('change', function () {
    if (this.value === 'custom') {
      // Show date inputs for custom range
      customControls.style.display = 'inline';
    } else {
      // Hide custom range inputs and update charts immediately
      customControls.style.display = 'none';
      drawCharts();  
    }
  });
  document.getElementById('applyRange').addEventListener('click', function () {
    // Update charts when custom range is applied
    drawCharts();
  });

  // Initial data load and draw
  updateData();
  // Auto-refresh data every 60 seconds
  setInterval(updateData, 60000);
  // Redraw charts on window resize for responsiveness
  window.addEventListener('resize', drawCharts);
}

// Fetch data from Google Sheets and update dashboard
function updateData() {
  const query = new google.visualization.Query(sheetUrl);
  query.send(function(response) {
    if (response.isError()) {
      console.error('Error fetching data: ' + response.getMessage());
      return;
    }
    // Store the retrieved data
    dataTable = response.getDataTable();
    // (Optional) Add a computed Total Power column by summing each circuit's power
    const numRows = dataTable.getNumberOfRows();
    if (numRows > 0) {
      const totalPowerColIndex = dataTable.addColumn('number', 'Total Power');
      for (let r = 0; r < numRows; r++) {
        // Columns 4,10,16,22 are assumed to be Power for circuits 1-4
        const p1 = dataTable.getValue(r, 4) || 0;
        const p2 = dataTable.getValue(r, 10) || 0;
        const p3 = dataTable.getValue(r, 16) || 0;
        const p4 = dataTable.getValue(r, 22) || 0;
        dataTable.setValue(r, totalPowerColIndex, p1 + p2 + p3 + p4);
      }
    }
    // Update current readings section and charts
    updateCurrentReadings();
    drawCharts();
  });
}

// Display the latest values for each circuit and total
function updateCurrentReadings() {
  if (!dataTable) return;
  const n = dataTable.getNumberOfRows();
  if (n === 0) return;
  const lastIndex = n - 1;
  // Loop through 4 circuits and fill their values
  for (let i = 1; i <= 4; i++) {
    const baseCol = 1 + (i - 1) * 6;  // starting column for circuit i (Voltage)
    document.getElementById('v' + i).textContent  = (dataTable.getValue(lastIndex, baseCol) || 0).toFixed(2);
    document.getElementById('i' + i).textContent  = (dataTable.getValue(lastIndex, baseCol + 1) || 0).toFixed(2);
    document.getElementById('pf' + i).textContent = (dataTable.getValue(lastIndex, baseCol + 2) || 0).toFixed(2);
    document.getElementById('p' + i).textContent  = (dataTable.getValue(lastIndex, baseCol + 3) || 0).toFixed(2);
    document.getElementById('e' + i).textContent  = (dataTable.getValue(lastIndex, baseCol + 4) || 0).toFixed(2);
    document.getElementById('c' + i).textContent  = (dataTable.getValue(lastIndex, baseCol + 5) || 0).toFixed(2);
  }
  // Total values (assuming Total Energy is col 25 and Total Cost is col 26 in the sheet)
  const totalEnergy = dataTable.getValue(lastIndex, 25) || 0;
  const totalCost   = dataTable.getValue(lastIndex, 26) || 0;
  // Total Power: we added as last column in dataTable (index = dataTable.getNumberOfColumns()-1)
  let totalPower = dataTable.getValue(lastIndex, dataTable.getNumberOfColumns() - 1);
  if (totalPower === null) {
    // If not computed above, sum the power columns on the fly
    totalPower = 0;
    [4, 10, 16, 22].forEach(colIndex => {
      totalPower += dataTable.getValue(lastIndex, colIndex) || 0;
    });
  }
  document.getElementById('total-power').textContent = totalPower.toFixed(2);
  document.getElementById('total-energy').textContent = totalEnergy.toFixed(2);
  document.getElementById('total-cost').textContent   = totalCost.toFixed(2);
}

// Draw/Update the charts based on selected time range
function drawCharts() {
  if (!dataTable) return;
  const range = document.getElementById('time-range').value;
  let rows = [];
  const now = new Date();
  if (range === 'all') {
    // All data points
    const totalRows = dataTable.getNumberOfRows();
    rows = Array.from({ length: totalRows }, (_, i) => i);
  } else if (range === '24hours') {
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    rows = dataTable.getFilteredRows([{ column: 0, minValue: start }]);
  } else if (range === '7days') {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    rows = dataTable.getFilteredRows([{ column: 0, minValue: start }]);
  } else if (range === '30days') {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    rows = dataTable.getFilteredRows([{ column: 0, minValue: start }]);
  } else if (range === 'custom') {
    const startInput = document.getElementById('start-date').value;
    const endInput   = document.getElementById('end-date').value;
    if (startInput && endInput) {
      const startDate = new Date(startInput);
      const endDate   = new Date(endInput);
      // Include the entire end date (set to end of day)
      endDate.setHours(23, 59, 59, 999);
      rows = dataTable.getFilteredRows([{ column: 0, minValue: startDate, maxValue: endDate }]);
    } else {
      rows = [];
    }
  }
  if (rows.length === 0) {
    // No data in the selected range – clear charts or return
    chartLine.clearChart();
    chartBar.clearChart();
    chartPie.clearChart();
    return;
  }
  rows.sort((a, b) => a - b);  // ensure rows are in ascending order

  // Line Chart – Power over time for each circuit and total
  const lastCol = dataTable.getNumberOfColumns() - 1;  // index of Total Power column
  const viewLine = new google.visualization.DataView(dataTable);
  viewLine.setRows(rows);
  // Columns: Time (0), Power1 (4), Power2 (10), Power3 (16), Power4 (22), Total Power (lastCol)
  viewLine.setColumns([0, 4, 10, 16, 22, lastCol]);
  const lineOptions = {
    title: 'Power Over Time',
    legend: { position: 'bottom' },
    curveType: 'function',
    hAxis: { title: 'Time' },
    vAxis: { title: 'Power (W)' },
    series: {
      4: { color: '#000', lineWidth: 3 }  // make total power line black & thicker (series index 4 = Total)
    }
  };
  chartLine.draw(viewLine, lineOptions);

  // Bar Chart – Daily cost within the range (sums cost per day)
  const dailyCosts = {};
  let prevRow = rows[0];
  let prevDate = formatDate(dataTable.getValue(prevRow, 0));
  dailyCosts[prevDate] = 0;
  for (let idx = 1; idx < rows.length; idx++) {
    const row = rows[idx];
    const currDate = formatDate(dataTable.getValue(row, 0));
    const prevCost = dataTable.getValue(prevRow, 26) || 0;  // total cost at previous reading
    const currCost = dataTable.getValue(row, 26) || 0;      // total cost at current reading
    const costDiff = currCost - prevCost;
    if (currDate === prevDate) {
      dailyCosts[currDate] += costDiff;
    } else {
      // New day starts
      if (!(currDate in dailyCosts)) {
        dailyCosts[currDate] = 0;
      }
      dailyCosts[currDate] += costDiff;
      prevDate = currDate;
    }
    prevRow = row;
  }
  // Prepare data table for bar chart
  const barDataArray = [['Date', 'Cost']];
  for (const date in dailyCosts) {
    // round to 2 decimals for clarity
    barDataArray.push([date, parseFloat(dailyCosts[date].toFixed(2))]);
  }
  barDataArray.sort((a, b) => (a[0] > b[0] ? 1 : -1));  // sort by date string
  const barDataTable = google.visualization.arrayToDataTable(barDataArray);
  const barOptions = {
    title: 'Daily Cost',
    legend: { position: 'none' },
    hAxis: { title: 'Date' },
    vAxis: { title: 'Cost' }
  };
  chartBar.draw(barDataTable, barOptions);

  // Pie Chart – Energy usage by circuit in the selected range
  const firstIndex = rows[0];
  const lastIndex  = rows[rows.length - 1];
  // Energy columns: 5, 11, 17, 23 for circuits 1-4 (assumed in sheet)
  let energy1 = (dataTable.getValue(lastIndex, 5)  || 0) - (dataTable.getValue(firstIndex, 5)  || 0);
  let energy2 = (dataTable.getValue(lastIndex, 11) || 0) - (dataTable.getValue(firstIndex, 11) || 0);
  let energy3 = (dataTable.getValue(lastIndex, 17) || 0) - (dataTable.getValue(firstIndex, 17) || 0);
  let energy4 = (dataTable.getValue(lastIndex, 23) || 0) - (dataTable.getValue(firstIndex, 23) || 0);
  if (energy1 < 0) energy1 = 0;
  if (energy2 < 0) energy2 = 0;
  if (energy3 < 0) energy3 = 0;
  if (energy4 < 0) energy4 = 0;
  const pieData = google.visualization.arrayToDataTable([
    ['Circuit', 'Energy Used (kWh)'],
    ['Circuit 1', parseFloat(energy1.toFixed(2))],
    ['Circuit 2', parseFloat(energy2.toFixed(2))],
    ['Circuit 3', parseFloat(energy3.toFixed(2))],
    ['Circuit 4', parseFloat(energy4.toFixed(2))]
  ]);
  const pieOptions = {
    title: 'Energy Usage by Circuit',
    pieHole: 0.4,  // donut style chart
    chartArea: { width: '90%', height: '80%' }
  };
  chartPie.draw(pieData, pieOptions);
}

// Helper: format a date (or datetime) value to YYYY-MM-DD string
function formatDate(dateVal) {
  const d = new Date(dateVal);
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

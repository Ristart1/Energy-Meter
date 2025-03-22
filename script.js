document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const statusMessage = document.getElementById("statusMessage");
  const tableBody = document.getElementById("tableBody");

  // Replace with your own Apps Script Web App URL (appended ?mode=read)
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7DulA91o5i9LFlMLoQsEGmgGZa7ob7J3OIkliH7n_mZzmUvK8PwM5w5q9UtQ2FkiC/exec?mode=read";

  fetchBtn.addEventListener("click", () => {
    statusMessage.textContent = "Fetching data...";
    fetchData();
  });

  function fetchData() {
    fetch(APPS_SCRIPT_URL)
      .then(response => response.json())
      .then(data => {
        // Clear the table body
        tableBody.innerHTML = "";
        data.forEach((row) => {
          const tr = document.createElement("tr");

          // Make sure the keys here match the header row in your sheet exactly
          tr.appendChild(createCell(rowObj["Timestamp"]));
          tr.appendChild(createCell(rowObj["Voltage (Vrms)"]));
          tr.appendChild(createCell(rowObj["Current 1 (Irms)"]));
          tr.appendChild(createCell(rowObj["PF 1"]));
          tr.appendChild(createCell(rowObj["Power 1 (W)"]));
          tr.appendChild(createCell(rowObj["Energy 1 (kWh)"]));
          tr.appendChild(createCell(rowObj["Current 2 (Irms)"]));
          tr.appendChild(createCell(rowObj["PF 2"]));
          tr.appendChild(createCell(rowObj["Power 2 (W)"]));
          tr.appendChild(createCell(rowObj["Energy 2 (kWh)"]));
          tr.appendChild(createCell(rowObj["Current 3 (Irms)"]));
          tr.appendChild(createCell(rowObj["PF 3"]));
          tr.appendChild(createCell(rowObj["Power 3 (W)"]));
          tr.appendChild(createCell(rowObj["Energy 3 (kWh)"]));
          tr.appendChild(createCell(rowObj["Current 4 (Irms)"]));
          tr.appendChild(createCell(rowObj["PF 4"]));
          tr.appendChild(createCell(rowObj["Power 4 (W)"]));
          tr.appendChild(createCell(rowObj["Energy 4 (kWh)"]));
          tr.appendChild(createCell(rowObj["total consumption"]));
          tr.appendChild(createCell(rowObj["Total Cost"]));

          tableBody.appendChild(tr);
        });
        statusMessage.textContent = "Data fetched successfully!";
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        statusMessage.textContent = "Error fetching data.";
      });
  }

  // Helper function to create table cells
  function createCell(textContent) {
    const td = document.createElement("td");
    td.textContent = (textContent !== undefined) ? textContent : "";
    return td;
  }
});

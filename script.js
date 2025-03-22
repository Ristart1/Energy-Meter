document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const statusMessage = document.getElementById("statusMessage");
  const tableBody = document.getElementById("tableBody");

  // Replace with your Apps Script Web App URL plus ?mode=read
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgazaj-Z1zgkcg6k3Rd5ApohNjlwvgQQ5QD7zymL-LlXgGqdUEaESL0dUgKH05ymGZUQ/exec?mode=read";

  fetchBtn.addEventListener("click", () => {
    statusMessage.textContent = "Fetching data...";
    fetchData();
  });

  function fetchData() {
    fetch(APPS_SCRIPT_URL)
      .then((response) => response.json())
      .then((data) => {
        statusMessage.textContent = "Data fetched successfully!";
        populateTable(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        statusMessage.textContent = "Error fetching data.";
      });
  }

  function populateTable(dataArray) {
    tableBody.innerHTML = ""; // clear existing rows

    dataArray.forEach((rowObj) => {
      const tr = document.createElement("tr");

      // EXACT keys must match your sheet headers
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
  }

  function createCell(textValue) {
    const td = document.createElement("td");
    td.textContent = textValue !== undefined ? textValue : "";
    return td;
  }
});

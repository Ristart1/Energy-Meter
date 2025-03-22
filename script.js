document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const statusMessage = document.getElementById("statusMessage");
  const tableBody = document.getElementById("tableBody");

  // Replace with your own Apps Script Web App URL (appended ?mode=read)
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyj_rUdKc2V4pKvaH7hSfrkH00Tdam7hRI7loa3O-kaamT_HGYZm1uM-Nlbe7PYEsiRYw/exec?mode=read";

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
          tr.appendChild(createCell(row["Timestamp"]));
          tr.appendChild(createCell(row["Voltage"]));
          tr.appendChild(createCell(row["Current(1)"]));
          tr.appendChild(createCell(row["Power(1)"]));
          tr.appendChild(createCell(row["Energy(1)"]));
          tr.appendChild(createCell(row["Current(2)"]));
          tr.appendChild(createCell(row["Power(2)"]));
          tr.appendChild(createCell(row["Energy(2)"]));
          tr.appendChild(createCell(row["Current(3)"]));
          tr.appendChild(createCell(row["Power(3)"]));
          tr.appendChild(createCell(row["Energy(3)"]));
          tr.appendChild(createCell(row["Current(4)"]));
          tr.appendChild(createCell(row["Power(4)"]));
          tr.appendChild(createCell(row["Energy(4)"]));
          tr.appendChild(createCell(row["total_consumption"]));
          tr.appendChild(createCell(row["cost"]));

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

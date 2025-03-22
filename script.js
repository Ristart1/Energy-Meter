/**************
 * BASIC LOGIN
 **************/
const validUsername = "demo"; // Hard-coded example
const validPassword = "demo123"; // Hard-coded example

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginView = document.getElementById("loginView");
const mainView = document.getElementById("mainView");

/**
 * On page load, check if the user is "logged in" 
 * in localStorage (for a simple approach).
 */
window.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn === "true") {
    showMainView();
    fetchDataAndPopulateTable();
  }
});

loginBtn.addEventListener("click", () => {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  
  if (
    usernameInput.value === validUsername && 
    passwordInput.value === validPassword
  ) {
    // Save in local storage
    localStorage.setItem("isLoggedIn", "true");
    showMainView();
    fetchDataAndPopulateTable();
  } else {
    alert("Invalid credentials!");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.setItem("isLoggedIn", "false");
  showLoginView();
});

function showMainView() {
  loginView.style.display = "none";
  mainView.style.display = "block";
}

function showLoginView() {
  loginView.style.display = "block";
  mainView.style.display = "none";
}

/***********************
 * FETCH AND DISPLAY DATA
 ***********************/
function fetchDataAndPopulateTable() {
  // TODO: Replace this URL with your published Apps Script web app URL
  // Make sure to append ?mode=read to trigger the JSON return
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZMUdhtpNagkiSqIcUebkJy-jMgcm01HgqVrF4SugiwwxYOnbiNdlkQS6SOd6H60FqVA/exec?mode=read";

  fetch(APPS_SCRIPT_URL)
    .then((response) => response.json())
    .then((data) => {
      // data is expected to be an array of objects
      populateTable(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function populateTable(dataArray) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = ""; // Clear old rows

  dataArray.forEach((rowObj) => {
    // Create a new row
    const row = document.createElement("tr");

    // Based on your header structure. 
    // Must match the columns you want to show.
    // Make sure these keys match the headers in your sheet!
    const timestampCell = createCell(rowObj["Timestamp"]);
    const voltageCell = createCell(rowObj["Voltage"]);
    const current1Cell = createCell(rowObj["Current(1)"]);
    const power1Cell = createCell(rowObj["Power(1)"]);
    const kWh1Cell = createCell(rowObj["Energy(1)"]);
    const current2Cell = createCell(rowObj["Current(2)"]);
    const power2Cell = createCell(rowObj["Power(2)"]);
    const kWh2Cell = createCell(rowObj["Energy(2)"]);
    const current3Cell = createCell(rowObj["Current(3)"]);
    const power3Cell = createCell(rowObj["Power(3)"]);
    const kWh3Cell = createCell(rowObj["Energy(3)"]);
    const current4Cell = createCell(rowObj["Current(4)"]);
    const power4Cell = createCell(rowObj["Power(4)"]);
    const kWh4Cell = createCell(rowObj["Energy(4)"]);
    const totalConsumptionCell = createCell(rowObj["total_consumption"]);
    const costCell = createCell(rowObj["cost"]);

    // Append them to the row
    row.appendChild(timestampCell);
    row.appendChild(voltageCell);
    row.appendChild(current1Cell);
    row.appendChild(power1Cell);
    row.appendChild(kWh1Cell);
    row.appendChild(current2Cell);
    row.appendChild(power2Cell);
    row.appendChild(kWh2Cell);
    row.appendChild(current3Cell);
    row.appendChild(power3Cell);
    row.appendChild(kWh3Cell);
    row.appendChild(current4Cell);
    row.appendChild(power4Cell);
    row.appendChild(kWh4Cell);
    row.appendChild(totalConsumptionCell);
    row.appendChild(costCell);

    // Finally, append the row
    tableBody.appendChild(row);
  });
}

function createCell(textValue) {
  const td = document.createElement("td");
  td.textContent = textValue !== undefined ? textValue : "";
  return td;
}

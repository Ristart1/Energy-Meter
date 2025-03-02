const SHEET_API_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"; // Replace with your deployed script URL

async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let response = await fetch(SHEET_API_URL, {
        method: "POST",
        body: JSON.stringify({ username: username, password: password }),
        headers: { "Content-Type": "application/json" }
    });

    let result = await response.text();

    if (result === "success") {
        localStorage.setItem("loggedInUser", username);
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        fetchData();
    } else {
        document.getElementById("login-error").innerText = (result === "incorrect_password") ? "Wrong Password!" : "User Not Found!";
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    document.getElementById("login-container").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
}

// Keep user logged in
window.onload = function() {
    if (localStorage.getItem("loggedInUser")) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        fetchData();
    }
};

// Fetch energy data for logged-in user
async function fetchData() {
    try {
        const response = await fetch(SHEET_API_URL);
        const text = await response.text();
        const rows = text.trim().split("\n").slice(1);  
        const data = rows.map(row => row.split(","));

        if (data.length === 0) return;

        let username = localStorage.getItem("loggedInUser");
        let userData = data.filter(row => row[0] === username); // Filter by user

        if (userData.length === 0) {
            console.warn("No data for this user.");
            return;
        }

        let latest = userData[userData.length - 1]; // Get latest row for this user
        document.getElementById("voltage").innerText = latest[2] + " V";
        document.getElementById("current").innerText = latest[3] + " A";
        document.getElementById("powerFactor").innerText = latest[5];
        document.getElementById("energy").innerText = latest[6] + " kWh";

        checkAlerts(parseFloat(latest[3]), parseFloat(latest[5]));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function checkAlerts(current, powerFactor) {
    let alertMessage = "";
    if (current > 10) alertMessage = "⚠️ High Current Detected!";
    if (powerFactor < 0.8) alertMessage = "⚠️ Low Power Factor Warning!";
    document.getElementById("alert").innerText = alertMessage;
}

setInterval(fetchData, 10000); // Fetch data every 10 seconds

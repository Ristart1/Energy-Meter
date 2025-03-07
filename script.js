const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwOGH7woP5lqAM8diEnEv7a-qfhIy1C1XSE1WV-lHIp9n88ydK-UB6sO-scWfeZu89h4g/exec"; // Replace with your Google Apps Script URL

let isSignUpMode = false; // Track if user is signing up

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    document.getElementById("form-title").innerText = isSignUpMode ? "Sign Up" : "Login";
    document.getElementById("submit-btn").innerText = isSignUpMode ? "Sign Up" : "Login";
    document.getElementById("toggle-text").innerText = isSignUpMode ? "Already have an account?" : "Don't have an account?";
}

async function handleAuth() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let endpoint = isSignUpMode ? "register" : "login";

    let response = await fetch(SHEET_API_URL, {
        method: "POST",
        body: JSON.stringify({ username: username, password: password, action: endpoint }),
        headers: { "Content-Type": "application/json" }
    });

    let result = await response.text();

    if (result === "success") {
        localStorage.setItem("loggedInUser", username);
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        fetchData();
    } else {
        document.getElementById("login-error").innerText = (result === "user_exists") ? "User already exists!" : 
                                                           (result === "incorrect_password") ? "Wrong Password!" : 
                                                           "User Not Found!";
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    document.getElementById("login-container").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
}

window.onload = function() {
    if (localStorage.getItem("loggedInUser")) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        fetchData();
    }
};

// Fetch data function remains the same...

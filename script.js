const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzJBI0ZcrZMmrA6wLc3F0M8fWqLU4nCpUK9pUr2S6nY_rotyVIqDN_wU82tQ42Inpzz0g/exec"; // Replace with your Google Apps Script URL

let isSignUpMode = false; // Track if user is signing up

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("submit-btn").addEventListener("click", handleAuth);
    document.getElementById("toggle-link").addEventListener("click", toggleAuthMode);
});

function toggleAuthMode(event) {
    event.preventDefault(); // Prevent default link behavior
    isSignUpMode = !isSignUpMode;
    document.getElementById("form-title").innerText = isSignUpMode ? "Sign Up" : "Login";
    document.getElementById("submit-btn").innerText = isSignUpMode ? "Sign Up" : "Login";
    document.getElementById("toggle-text").innerText = isSignUpMode ? "Already have an account?" : "Don't have an account?";
    document.getElementById("toggle-link").innerText = isSignUpMode ? "Log In" : "Sign Up";
}

async function handleAuth() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (!username || !password) {
        document.getElementById("login-error").innerText = "Please enter a username and password!";
        return;
    }

    let endpoint = isSignUpMode ? "register" : "login";

    try {
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
            document.getElementById("login-error").innerText = 
                result === "user_exists" ? "User already exists!" : 
                result === "incorrect_password" ? "Wrong Password!" : 
                "User Not Found!";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("login-error").innerText = "Network error. Try again!";
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

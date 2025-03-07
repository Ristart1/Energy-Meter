const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzJBI0ZcrZMmrA6wLc3F0M8fWqLU4nCpUK9pUr2S6nY_rotyVIqDN_wU82tQ42Inpzz0g/exec"; // Replace with your actual Google Apps Script URL

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

// ✅ Handles Login and Registration with Improved Debugging
async function handleAuth() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let errorMessage = document.getElementById("login-error");

    if (!username || !password) {
        errorMessage.innerText = "Please enter a username and password!";
        return;
    }

    let action = isSignUpMode ? "register" : "login";

    try {
        console.log("📡 Sending request to API...");
        let response = await fetch(SHEET_API_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password, action })
        });

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let result = await response.json();
        console.log("📡 API Response:", result);

        if (result.status === "success") {
            localStorage.setItem("loggedInUser", username);
            document.getElementById("login-container").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            fetchData();
        } else {
            errorMessage.innerText = result.message || "An error occurred!";
        }
    } catch (error) {
        console.error("❌ Network Error:", error);
        errorMessage.innerText = "Server error. Try again!";
    }
}

// ✅ Handles Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    document.getElementById("login-container").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
}

// ✅ Ensures user remains logged in on page reload
window.onload = function() {
    if (localStorage.getItem("loggedInUser")) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        fetchData();
    }
};

// ✅ Fetch data function (ensure your fetch logic is correctly implemented)
async function fetchData() {
    console.log("📡 Fetching user data...");
}

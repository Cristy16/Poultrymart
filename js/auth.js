// Toggle between Login and Register
function switchAuth(type) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('tab-login');
    const regTab = document.getElementById('tab-register');
    const demoBox = document.querySelector('.demo-box'); // The demo accounts list

    if (type === 'register') {
        loginForm.classList.add('d-none');
        regForm.classList.remove('d-none');
        loginTab.classList.remove('active');
        regTab.classList.add('active');
        if(demoBox) demoBox.parentElement.classList.add('d-none'); // Hide demo box on register
    } else {
        regForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
        regTab.classList.remove('active');
        loginTab.classList.add('active');
        if(demoBox) demoBox.parentElement.classList.remove('d-none'); // Show demo box on login
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Handle Login Submit
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim().toLowerCase();
            
            let user = null;

            // Logic for Demo Accounts
            if (email === "admin@poultrymart.ph") {
                user = { name: "Admin User", role: "admin", email: email };
                localStorage.setItem("currentUser", JSON.stringify(user));
                window.location.href = "dashboard/admin.html";
            } else if (email === "customer@email.com") {
                user = { name: "Customer User", role: "customer", email: email };
                localStorage.setItem("currentUser", JSON.stringify(user));
                window.location.href = "../../index.html";
            } else {
                alert("Account not found. Use: customer@email.com");
            }
        });
    }

    // Handle Register Submit
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function(e) {
            e.preventDefault();
            // Simulate successful registration
            alert("Account created successfully! Please login with your new credentials.");
            switchAuth('login');
        });
    }
});

document.addEventListener("submit", (e) => {
    if (e.target && e.target.id === "navSearchForm") {
        e.preventDefault(); // Stop page from refreshing
        
        const queryInput = document.getElementById("navSearchInput");
        const query = queryInput ? queryInput.value.trim() : "";

        if (query) {
            const currentPath = window.location.pathname;
            let targetUrl = "";

            // Check if we are at root (index.html) or in a subfolder (pages/)
            if (currentPath.includes('/pages/') || currentPath.includes('/dashboard/')) {
                // If already in pages or dashboard, catalog.html is in the same or parent folder
                targetUrl = currentPath.includes('/dashboard/') ? "../catalog.html" : "catalog.html";
            } else {
                // If at root (index.html), go into the pages folder
                targetUrl = "pages/catalog.html";
            }

            // Redirect with the search term in the URL
            window.location.href = `${targetUrl}?search=${encodeURIComponent(query)}`;
        }
    }
});

// This function handles the UI changes in the navbar
function updateNavbarUI() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const loginBtn = document.getElementById("nav-login-btn");
    const userSection = document.getElementById("nav-user-section");
    const usernameText = document.getElementById("nav-username");
    const ordersLink = document.getElementById("nav-orders");

    if (user && loginBtn && userSection) {
        loginBtn.classList.add("d-none");
        userSection.classList.remove("d-none");
        userSection.classList.add("d-flex");
        usernameText.innerText = user.name;
        if(ordersLink) ordersLink.classList.remove("d-none");
    }
}

// Global logout function
function logoutUser() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../index.html";
}

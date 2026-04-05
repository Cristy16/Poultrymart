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
            
            // Redirection logic for Demo Accounts
            if (email === "admin@poultrymart.ph") {
                window.location.href = "dashboard/admin.html";
            } else if (email === "staff@poultrymart.ph") {
                window.location.href = "dashboard/staff.html";
            } else if (email === "rider@poultrymart.ph") {
                window.location.href = "dashboard/rider.html";
            } else if (email === "customer@email.com") {
                window.location.href = "dashboard/customer.html";
            } else {
                alert("Account not found. Please use the demo accounts provided.");
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
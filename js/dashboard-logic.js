// js/dashboard-logic.js
document.addEventListener('DOMContentLoaded', () => {
    fetch("../../components/sidebar.html")
        .then(res => res.text())
        .then(data => {
            const container = document.getElementById("sidebar-container");
            if (container) {
                container.innerHTML = data;
                setupSidebar();
            }
        });
});

function setupSidebar() {
    const currentPage = window.location.pathname.split("/").pop();
    
    // --- ROLE LINK DEFINITIONS ---
    const riderLinks = [
        { name: "Today's Deliveries", icon: "bi-clock-history", url: "rider.html" },
        { name: "Route Map", icon: "bi-geo-alt", url: "route-map.html" },
        { name: "Active Delivery", icon: "bi-box-seam", url: "active-delivery.html" },
        { name: "Completed", icon: "bi-check2-circle", url: "completed.html" }
    ];

    const staffLinks = [
        { name: "Order Queue", icon: "bi-list-ul", url: "staff.html" },
        { name: "Packing Station", icon: "bi-box-seam", url: "packing.html" },
        { name: "Ready for Pickup", icon: "bi-check2-all", url: "ready-pickup.html" }
    ];

    const adminLinks = [
        { name: "Dashboard", icon: "bi-grid-1x2", url: "admin.html" },
        { name: "Product Management", icon: "bi-box", url: "products.html" },
        { name: "Order Management", icon: "bi-cart-check", url: "orders.html" },
        { name: "Inventory", icon: "bi-journal-bookmark", url: "inventory.html" },
        { name: "Promotions", icon: "bi-tag", url: "promotions.html" },
        { name: "Customer Management", icon: "bi-people", url: "customer-management.html" },
        { name: "Reports & Analytics", icon: "bi-graph-up-arrow", url: "reports.html" },
        { name: "Settings", icon: "bi-gear", url: "settings.html" }
    ];

    // --- ROLE DETECTION ---
    const isAdminPage = ["admin.html", "products.html", "orders.html", "inventory.html", "promotions.html", "customer-management.html", "reports.html", "settings.html"].includes(currentPage);
    const isStaffPage = ["staff.html", "packing.html", "ready-pickup.html"].includes(currentPage);
    
    let links, roleLabel, userName, userEmail, subLabel;

    if (isAdminPage) {
        links = adminLinks;
        roleLabel = "ADMIN PANEL";
        userName = "Admin User";
        userEmail = "admin@poultrymart.ph";
        subLabel = "Super Admin";
    } else if (isStaffPage) {
        links = staffLinks;
        roleLabel = "FULFILLMENT OPS";
        userName = "Fulfillment Staff";
        userEmail = "staff@poultrymart.ph";
        subLabel = "Fulfillment Staff";
    } else {
        links = riderLinks;
        roleLabel = "DELIVERY APP";
        userName = "Rider #102";
        userEmail = "rider@poultrymart.ph";
        subLabel = "Delivery Rider";
    }

    // --- UI INJECTION ---
    const labelEl = document.getElementById('role-label');
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    const subLabelEl = document.getElementById('user-sublabel'); // New for Admin profile

    if (labelEl) labelEl.innerText = roleLabel;
    if (nameEl) nameEl.innerText = userName;
    if (emailEl) emailEl.innerText = userEmail;
    if (subLabelEl) subLabelEl.innerText = subLabel;

    const nav = document.getElementById('sidebar-nav');
    if (nav) {
        nav.innerHTML = links.map(link => `
            <a href="${link.url}" class="nav-link rider-nav-link ${currentPage === link.url ? 'active' : ''}">
                <i class="bi ${link.icon} me-3"></i> ${link.name}
            </a>
        `).join('');
    }
}

function logout() {
    if(confirm("Logout?")) window.location.href = "../../index.html";
}
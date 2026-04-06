// js/dashboard-logic.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check: Redirect if not logged in or wrong role
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const path = window.location.pathname;
    
    if (!user) {
        window.location.href = "../../pages/login.html";
        return;
    }

    // 2. Load Sidebar Components
    fetch("../../components/sidebar.html")
        .then(res => res.text())
        .then(data => {
            const container = document.getElementById("sidebar-container");
            if (container) {
                container.innerHTML = data;
                setupSidebar(user); // Pass user to customize sidebar
            }
        });

    // 3. Initialize Dashboard Data (Only if on admin.html)
    if (path.includes("admin.html")) {
        initAdminDashboard();
    }
});

/**
 * Sidebar UI Setup & Navigation logic
 */
function setupSidebar(user) {
    const currentPage = window.location.pathname.split("/").pop();
    
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
        { name: "Promotions", icon: "bi-tag", url: "promotions.html" }, // <--- Check this line
        { name: "Customer Management", icon: "bi-people", url: "customer-management.html" },
        { name: "Reports & Analytics", icon: "bi-graph-up-arrow", url: "reports.html" },
        { name: "Settings", icon: "bi-gear", url: "settings.html" }
    ];

    // Detect Role based on the user object from localStorage
    let links, roleLabel;
    if (user.role === 'admin') {
        links = adminLinks;
        roleLabel = "ADMIN PANEL";
    } else if (user.role === 'staff') {
        links = staffLinks;
        roleLabel = "FULFILLMENT OPS";
    } else {
        links = riderLinks;
        roleLabel = "DELIVERY APP";
    }

    // Update Sidebar Profile Info
    const labelEl = document.getElementById('role-label');
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');

    if (labelEl) labelEl.innerText = roleLabel;
    if (nameEl) nameEl.innerText = user.name || "User";
    if (emailEl) emailEl.innerText = user.email || "";

    // Inject Navigation Links
    const nav = document.getElementById('sidebar-nav');
    if (nav) {
        nav.innerHTML = links.map(link => `
            <a href="${link.url}" class="nav-link rider-nav-link ${currentPage === link.url ? 'active' : ''}">
                <i class="bi ${link.icon} me-3"></i> ${link.name}
            </a>
        `).join('');
    }
}

/**
 * Admin Dashboard Logic: Fetching and Displaying Live Stats
 */
async function initAdminDashboard() {
    try {
        const [ordersRes, productsRes] = await Promise.all([
            fetch("../../data/orders.json"),
            fetch("../../data/products.json")
        ]);

        const orders = await ordersRes.json();
        const products = await productsRes.json();

        // --- 1. Top Stat Cards ---
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const lowStockCount = products.filter(p => p.stock < 10).length;
        
        // Update Stats UI (Ensure these IDs exist in your HTML)
        updateElementText('stat-revenue', `₱${totalRevenue.toFixed(2)}`);
        updateElementText('stat-pending', pendingOrders);
        updateElementText('stat-low-stock', lowStockCount);
        updateElementText('stat-total-orders', orders.length);

        // --- 2. Order Status Breakdown ---
        const statusMap = {
            'pending': 0,
            'packed': 0,
            'out-for-delivery': 0,
            'completed': 0
        };
        orders.forEach(o => statusMap[o.status]++);

        updateElementText('count-pending', statusMap['pending']);
        updateElementText('count-packed', statusMap['packed']);
        updateElementText('count-delivery', statusMap['out-for-delivery']);
        updateElementText('count-completed', statusMap['completed']);

        // --- 3. Render Recent Orders List ---
        renderRecentOrders(orders);

    } catch (error) {
        console.error("Dashboard Init Error:", error);
    }
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;

    // Get the last 3 orders
    const recent = orders.slice(-3).reverse();

    container.innerHTML = recent.map(order => {
        const statusClass = order.status === 'completed' ? 'bg-secondary' : 'bg-info';
        const date = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `
            <div class="bg-dark bg-opacity-25 p-3 rounded-3 border border-secondary border-opacity-10 d-flex justify-content-between align-items-center mb-3">
                <div>
                    <p class="mb-0 fw-bold">${order.id}</p>
                    <small class="text-white-50">${date} • ${order.customer}</small>
                </div>
                <div class="text-end">
                    <span class="badge ${statusClass} bg-opacity-10 text-white rounded-pill mb-1" style="font-size: 0.7rem;">
                        ${order.status.replace(/-/g, ' ')}
                    </span>
                    <p class="mb-0 fw-bold">₱${order.total.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Helper to prevent errors if ID is missing in HTML
function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function logout() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("currentUser");
        window.location.href = "../../index.html";
    }
}

/**
 * js/cart.js
 * Centralized logic for PoultryMart Shopping Cart & Checkout
 */

let cart = JSON.parse(localStorage.getItem('cart_items')) || [];

// --- 1. ADD TO CART LOGIC (With Auth Check) ---
function addToCart(productId, name, price, image, category, weight = 0.5) {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert("Please login to add items to your cart.");
        window.location.href = "/pages/login.html"; // Adjust path if needed
        return;
    }

    cart = JSON.parse(localStorage.getItem('cart_items')) || [];
    const existingItem = cart.find(item => String(item.id) === String(productId));

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: productId, name, price: parseFloat(price),
            image, category, weight: parseFloat(weight), qty: 1
        });
    }

    saveCart();
    updateCartBadge();
    alert(`${name} added to cart!`);
}

function saveCart() {
    localStorage.setItem('cart_items', JSON.stringify(cart));
}

function updateCartBadge() {
    const currentCart = JSON.parse(localStorage.getItem('cart_items')) || [];
    const badge = document.querySelector('.badge.bg-info'); 
    if (badge) {
        const totalItems = currentCart.reduce((sum, item) => sum + item.qty, 0);
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? "inline-block" : "none";
    }
}

// --- 2. RENDER CART PAGE ---
async function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('subtotal'); // Added ID to your HTML <span>
    const totalEl = document.getElementById('total');
    
    if (!container) return;
    const currentCart = JSON.parse(localStorage.getItem('cart_items')) || [];

    if (currentCart.length === 0) {
        container.innerHTML = `<div class="text-center py-5 glass-panel rounded-4"><h4>Your cart is empty</h4></div>`;
        if(totalEl) totalEl.innerText = "₱0.00";
        return;
    }

    const template = await fetch('../components/cart-item.html').then(res => res.text());
    container.innerHTML = "";
    let subtotal = 0;

    currentCart.forEach(item => {
        const itemTotal = item.price * item.weight * item.qty;
        subtotal += itemTotal;
        container.innerHTML += template
            .replace(/{{id}}/g, item.id).replace(/{{name}}/g, item.name)
            .replace(/{{price}}/g, item.price.toFixed(2)).replace(/{{qty}}/g, item.qty)
            .replace(/{{image}}/g, item.image).replace(/{{itemTotal}}/g, itemTotal.toFixed(2));
    });

    if(subtotalEl) subtotalEl.innerText = `₱${subtotal.toFixed(2)}`;
    if(totalEl) totalEl.innerText = `₱${(subtotal + 50).toFixed(2)}`;
}

// --- 3. RENDER CHECKOUT PREVIEW ---
function renderCheckoutPreview() {
    const container = document.getElementById('checkout-items-preview');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');

    if (!container) return;
    const currentCart = JSON.parse(localStorage.getItem('cart_items')) || [];
    
    container.innerHTML = "";
    let subtotal = 0;

    currentCart.forEach(item => {
        const itemTotal = item.price * item.weight * item.qty;
        subtotal += itemTotal;
        container.innerHTML += `
            <div class="d-flex justify-content-between small text-white-50 mb-2">
                <span>${item.name} × ${item.qty}</span>
                <span>₱${itemTotal.toFixed(2)}</span>
            </div>`;
    });

    subtotalEl.innerText = `₱${subtotal.toFixed(2)}`;
    totalEl.innerText = `₱${(subtotal + 50).toFixed(2)}`;
}

function removeFromCart(id) {
    cart = cart.filter(item => String(item.id) !== String(id));
    saveCart(); renderCartPage(); updateCartBadge();
}

document.addEventListener('DOMContentLoaded', updateCartBadge);

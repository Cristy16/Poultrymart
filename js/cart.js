/**
 * js/cart.js
 * Centralized logic for PoultryMart Shopping Cart
 */

// Initialize global cart variable from localStorage
let cart = JSON.parse(localStorage.getItem('cart_items')) || [];

// --- 1. ADD TO CART LOGIC ---
function addToCart(productId, name, price, image, category, weight = 0.5) {
    // Always refresh the cart from storage first to prevent overwriting
    cart = JSON.parse(localStorage.getItem('cart_items')) || [];

    // Ensure ID comparison works by converting both to Strings
    const existingItem = cart.find(item => String(item.id) === String(productId));

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: parseFloat(price),
            image: image,
            category: category,
            weight: parseFloat(weight), 
            qty: 1
        });
    }

    saveCart();
    updateCartBadge();
    
    // Simple visual feedback
    alert(`${name} added to cart!`);
}

// --- 2. SAVE & SYNC ---
function saveCart() {
    localStorage.setItem('cart_items', JSON.stringify(cart));
}

function updateCartBadge() {
    const currentCart = JSON.parse(localStorage.getItem('cart_items')) || [];
    const badge = document.querySelector('.badge.bg-info'); 
    
    if (badge) {
        const totalItems = currentCart.reduce((sum, item) => sum + item.qty, 0);
        badge.innerText = totalItems;
        // Hide badge if empty for a cleaner look
        badge.style.display = totalItems > 0 ? "inline-block" : "none";
    }
}

// --- 3. RENDER CART PAGE ---
async function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (!container) return; // Only run if we are on cart.html

    // Get fresh data
    const currentCart = JSON.parse(localStorage.getItem('cart_items')) || [];

    // Handle Empty State
    if (currentCart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 glass-panel rounded-4 border border-secondary border-opacity-25">
                <i class="bi bi-cart-x fs-1 text-muted"></i>
                <h4 class="mt-3 text-white-50">Your cart is empty</h4>
                <p class="text-muted">Looks like you haven't added any poultry yet.</p>
                <a href="catalog.html" class="btn btn-cyan mt-2 px-4 rounded-pill">Go Shopping</a>
            </div>`;
        if(subtotalEl) subtotalEl.innerText = "₱0.00";
        if(totalEl) totalEl.innerText = "₱0.00";
        return;
    }

    try {
        // Fetch the component template
        const template = await fetch('../components/cart-item.html').then(res => res.text());
        
        container.innerHTML = "";
        let subtotal = 0;

        currentCart.forEach(item => {
            const itemTotal = item.price * item.weight * item.qty;
            subtotal += itemTotal;

            // Replace placeholders with actual data
            let html = template
                .replace(/{{id}}/g, item.id)
                .replace(/{{name}}/g, item.name)
                .replace(/{{category}}/g, item.category)
                .replace(/{{price}}/g, item.price.toFixed(2))
                .replace(/{{weight}}/g, item.weight)
                .replace(/{{qty}}/g, item.qty)
                .replace(/{{image}}/g, item.image)
                .replace(/{{itemTotal}}/g, itemTotal.toFixed(2));
            
            container.innerHTML += html;
        });

        // Update Summary Totals
        if(subtotalEl) subtotalEl.innerText = `₱${subtotal.toFixed(2)}`;
        if(totalEl) totalEl.innerText = `₱${(subtotal + 50).toFixed(2)}`;

    } catch (error) {
        console.error("Error rendering cart:", error);
        container.innerHTML = `<p class="text-danger">Failed to load cart items. Please refresh.</p>`;
    }
}

// --- 4. ITEM MANIPULATION ---
function removeFromCart(id) {
    cart = JSON.parse(localStorage.getItem('cart_items')) || [];
    cart = cart.filter(item => String(item.id) !== String(id));
    saveCart();
    renderCartPage();
    updateCartBadge();
}

function changeCartQty(id, delta) {
    cart = JSON.parse(localStorage.getItem('cart_items')) || [];
    const item = cart.find(i => String(i.id) === String(id));
    
    if (item) {
        item.qty += delta;
        // If qty hits 0, remove the item entirely
        if (item.qty < 1) {
            removeFromCart(id);
            return;
        }
    }
    
    saveCart();
    renderCartPage();
    updateCartBadge();
}

// Run badge update on every page load globally
document.addEventListener('DOMContentLoaded', updateCartBadge);
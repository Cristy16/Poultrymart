let allProducts = [];

/**
 * 1. GENERAL CATALOG RENDERING
 * Handles both index.html and catalog.html using smart pathing
 */
async function renderProducts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Detect if we are in the 'pages' folder or the root
    const isRoot = !window.location.pathname.includes('/pages/');
    const componentPath = isRoot ? "components/product-card.html" : "../components/product-card.html";
    const dataPath = isRoot ? "data/products.json" : "../data/products.json";

    try {
        const template = await fetch(componentPath).then(res => res.text());
        allProducts = await fetch(dataPath).then(res => res.json());

        displayProducts(allProducts, template, container, isRoot);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function displayProducts(products, template, container, isRoot) {
    if (!container) return;
    container.innerHTML = "";

    products.forEach(product => {
        // Adjust paths for images and links based on location
        const imgPath = isRoot ? product.image : `../${product.image}`;
        const linkPath = isRoot ? `pages/product.html?id=${product.id}` : `product.html?id=${product.id}`;

        let card = template
            .replace(/{{id}}/g, product.id)
            .replace(/{{name}}/g, product.name)
            .replace(/{{category}}/g, product.category)
            .replace(/{{price}}/g, product.price.toFixed(2))
            .replace(/{{rating}}/g, product.rating)
            .replace(/{{reviews}}/g, product.reviews)
            .replace(/{{image}}/g, imgPath)
            .replace(/{{badge}}/g, product.badge)
            .replace(/{{link}}/g, linkPath);

        container.innerHTML += card;
    });
}

/**
 * 2. SEARCH + FILTER LOGIC
 */
document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("searchInput");
    const filter = document.getElementById("categoryFilter");

    if (search && filter) {
        search.addEventListener("input", applyFilters);
        filter.addEventListener("change", applyFilters);
    }
});

async function applyFilters() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const categoryValue = document.getElementById("categoryFilter").value;

    // Filter templates usually only exist in catalog.html (not root)
    const template = await fetch("../components/product-card.html").then(res => res.text());

    let filtered = allProducts.filter(p => {
        return (
            p.name.toLowerCase().includes(searchValue) &&
            (categoryValue === "all" || p.category.includes(categoryValue))
        );
    });

    displayProducts(filtered, template, document.getElementById("catalog-container"), false);
}

/**
 * 3. PRODUCT DETAILS PAGE LOGIC
 */
async function renderProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id')) || 1;

    const products = await fetch("../data/products.json").then(res => res.json());
    const product = products.find(p => p.id === productId);

    if (!product) return;

    // Fill Page Elements
    document.getElementById('main-img').src = `../${product.image}`;
    document.getElementById('p-name').innerText = product.name;
    document.getElementById('p-category').innerText = product.category;
    document.getElementById('p-price').innerText = `₱${product.price.toFixed(2)}`;
    document.getElementById('p-rating').innerText = product.rating;
    document.getElementById('p-reviews').innerText = `(${product.reviews} reviews)`;
    document.getElementById('p-desc').innerText = product.description || "Tender and fresh poultry product, perfect for any recipe.";
    
    // Set data attribute for the add button
    const addBtn = document.getElementById('add-btn');
    if (addBtn) {
        addBtn.dataset.id = product.id;
        // Specific listener for product page to handle custom quantity
        addBtn.onclick = () => {
            const qty = parseInt(document.getElementById('qty').value) || 1;
            for(let i = 0; i < qty; i++) {
                addToCart(product.id, product.name, product.price, product.image, product.category, product.weight || 0.5);
            }
        };
    }

    // Related Products Logic
    const relatedContainer = document.getElementById("related-products-container");
    if (relatedContainer) {
        let cardTemplate = await fetch("../components/product-card.html").then(res => res.text());
        const related = products.filter(p => p.category === product.category && p.id !== product.id);
        displayProducts(related.slice(0, 4), cardTemplate, relatedContainer, false);
    }
}

function updateQty(change) {
    const qtyInput = document.getElementById('qty');
    if (!qtyInput) return;
    let currentVal = parseInt(qtyInput.value);
    currentVal += change;
    if (currentVal < 1) currentVal = 1;
    qtyInput.value = currentVal;
}

/**
 * 4. GLOBAL EVENT LISTENER FOR "ADD TO CART"
 * Handles buttons inside dynamically generated cards
 */
document.addEventListener('click', async (e) => {
    // Check if the clicked element (or its parent icon) is the add-to-cart button
    const btn = e.target.closest('.add-to-cart');
    if (btn) {
        const productId = parseInt(btn.dataset.id);
        
        // Use allProducts if already loaded, otherwise fetch
        let sourceData = allProducts.length ? allProducts : await fetch("../data/products.json").then(res => res.json());
        const product = sourceData.find(p => p.id === productId);

        if (product) {
            addToCart(
                product.id, 
                product.name, 
                product.price, 
                product.image, 
                product.category,
                product.weight || 0.5
            );
        }
    }
});
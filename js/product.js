let allProducts = [];

/**
 * 1. GENERAL CATALOG RENDERING
 */
// Modify your existing renderProducts function in js/product.js
async function renderProducts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isRoot = !window.location.pathname.includes('/pages/');
    const dataPath = isRoot ? "data/products.json" : "../data/products.json";
    const templatePath = isRoot ? "components/product-card.html" : "../components/product-card.html";

    try {
        const template = await fetch(templatePath).then(res => res.text());
        allProducts = await fetch(dataPath).then(res => res.json());

        // --- THE MAGIC PART: Check for URL Parameters ---
        const params = new URLSearchParams(window.location.search);
        const urlSearch = params.get('search');
        
        if (urlSearch) {
            // 1. Put the searched word into the Catalog's search bar so the user sees it
            const catalogSearchInput = document.querySelector('.search-input');
            if (catalogSearchInput) catalogSearchInput.value = urlSearch;
            
            // 2. Filter the list immediately
            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(urlSearch.toLowerCase()) ||
                p.category.toLowerCase().includes(urlSearch.toLowerCase())
            );
            displayProducts(filtered, template, container, isRoot);
        } else {
            // No search parameter, show everything
            displayProducts(allProducts, template, container, isRoot);
        }
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function displayProducts(products, template, container, isRoot) {
    if (!container) return;
    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-white-50">No products found.</div>`;
        updateCounter(0);
        return;
    }

    products.forEach(product => {
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
            .replace(/{{badge}}/g, product.badge || 'Fresh')
            .replace(/{{link}}/g, linkPath);

        container.innerHTML += card;
    });

    updateCounter(products.length);
}

function updateCounter(count) {
    const el = document.getElementById('productCount');
    if (el) el.innerText = count;
}

/**
 * 2. SEARCH + FILTER + SORT ENGINE
 */
async function applyFilters() {
    // Get Search from Navbar, Filter and Sort from Catalog page
    const searchInput = document.querySelector('.search-input');
    const searchValue = searchInput ? searchInput.value.toLowerCase() : "";
    const categoryValue = document.getElementById("categoryFilter")?.value || "all";
    const sortValue = document.getElementById("sortBy")?.value || "default";

    const isRoot = !window.location.pathname.includes('/pages/');
    const componentPath = isRoot ? "components/product-card.html" : "../components/product-card.html";
    const template = await fetch(componentPath).then(res => res.text());

    // Filter Logic
    let filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchValue);
        const matchesCategory = categoryValue === "all" || p.category.includes(categoryValue);
        return matchesSearch && matchesCategory;
    });

    // Sort Logic
    if (sortValue === "price-low") filtered.sort((a, b) => a.price - b.price);
    else if (sortValue === "price-high") filtered.sort((a, b) => b.price - a.price);
    else if (sortValue === "rating") filtered.sort((a, b) => b.rating - a.rating);
    else if (sortValue === "newest") filtered.sort((a, b) => b.id - a.id);

    displayProducts(filtered, template, document.getElementById("catalog-container"), isRoot);
}

// Global listener for "Add to Cart"
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (btn) {
        const productId = parseInt(btn.dataset.id);
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            addToCart(product.id, product.name, product.price, product.image, product.category, product.weight || 0.5);
        }
    }
});

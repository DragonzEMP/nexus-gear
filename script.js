// ==========================================================================
// 1. INITIAL PRODUCT DATABASE (SEEDED TO LOCALSTORAGE)
// ==========================================================================
const defaultProducts = [
  {
    id: 101,
    name: "AULA F75 Tri-Mode Mechanical Keyboard",
    category: "Keyboards",
    price: 5250,
    originalPrice: 5999,
    tag: "NEW",
    isNew: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 102,
    name: "8BitDo Ultimate 2C Wireless Controller",
    category: "Gamepads",
    price: 2799,
    originalPrice: 3200,
    tag: "HOT",
    isNew: false,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 103,
    name: "LINGBAO M1 Pro 1000Hz Wireless Gaming Mouse",
    category: "Mice",
    price: 2099,
    originalPrice: 2499,
    tag: "SALE",
    isNew: true,
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 104,
    name: "HyperX QuadCast S RGB Condenser Mic",
    category: "Audio",
    price: 16000,
    originalPrice: 17500,
    tag: "HOT",
    isNew: false,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 105,
    name: "Samsung Odyssey G5 27\" 180Hz QHD Monitor",
    category: "Monitors",
    price: 75000,
    originalPrice: 82000,
    tag: "PRO",
    isNew: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 106,
    name: "ATK Blazing Sky F1 Ultimate Mouse",
    category: "Mice",
    price: 3899,
    originalPrice: 4200,
    tag: "NEW",
    isNew: true,
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80"
  }
];

// ==========================================================================
// 1. FETCH PRODUCTS FROM BACKEND API
// ==========================================================================

// Helper: Cart storage management (Cart still stays local per visitor)
function getCart() {
  return JSON.parse(localStorage.getItem("ggez_cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("ggez_cart", JSON.stringify(cart));
  updateCartUI();
}

// Fetch products live from your Express server (/api/products)
async function fetchProductsFromAPI() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching products from server:", error);
    return [];
  }
}

// ==========================================================================
// 2. DYNAMIC PRODUCT GRID RENDERING (SERVER DATA)
// ==========================================================================
async function renderProducts() {
  // Fetch live products from backend
  const products = await fetchProductsFromAPI();

  const newGrid = document.getElementById("new-products-grid");
  const featuredGrid = document.getElementById("featured-products-grid");

  if (!newGrid || !featuredGrid) return;

  newGrid.innerHTML = "";
  featuredGrid.innerHTML = "";

  if (products.length === 0) {
    newGrid.innerHTML = `<p class="empty-msg">No products found on server.</p>`;
    featuredGrid.innerHTML = `<p class="empty-msg">No products found on server.</p>`;
    return;
  }

  // 1. Filter Trending / New Items
  const trendingProducts = products.filter(p => p.isNew);
  
  // 2. Filter Featured Items
  const featuredProducts = products.filter(p => p.isFeatured);

  // Helper function to build card HTML
  const createCardHTML = (p) => `
    <div class="product-card">
      <a href="product.html?id=${p.id}" class="card-img-wrap" style="display:block;">
        ${p.tag ? `<span class="card-tag ${p.tag === 'HOT' ? 'badge-hot' : 'badge-new'}">${p.tag}</span>` : ''}
        <img src="${p.image}" alt="${p.name}">
      </a>
      <div class="card-info">
        <h3>
          <a href="product.html?id=${p.id}" style="color:inherit; text-decoration:none;">${p.name}</a>
        </h3>
        <div class="card-price-row">
          <span class="price-current">৳ ${p.price.toLocaleString()}</span>
        </div>
        <button class="add-cart-btn" onclick="addToCart(${p.id})">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  `;

  // Render into Trending Grid
  if (trendingProducts.length > 0) {
    trendingProducts.forEach(p => newGrid.innerHTML += createCardHTML(p));
  } else {
    newGrid.innerHTML = `<p class="empty-msg">No trending products selected.</p>`;
  }

  // Render into Featured Grid
  if (featuredProducts.length > 0) {
    featuredProducts.forEach(p => featuredGrid.innerHTML += createCardHTML(p));
  } else {
    featuredGrid.innerHTML = `<p class="empty-msg">No featured products selected.</p>`;
  }
}

// Add to Cart helper updated to work with server product data
async function addToCart(productId) {
  const products = await fetchProductsFromAPI();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  let cart = getCart();
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  openCartDrawer();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
}

function updateCartUI() {
  const cart = getCart();
  const cartCountEl = document.getElementById("cart-count");
  const drawerCartCountEl = document.getElementById("drawer-cart-count");
  const cartItemsEl = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");

  // Calculate Total Quantity & Subtotal
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cartCountEl) cartCountEl.textContent = totalQty;
  if (drawerCartCountEl) drawerCartCountEl.textContent = totalQty;
  if (subtotalEl) subtotalEl.textContent = `৳ ${totalCost.toLocaleString()}`;

  // Render Drawer Items
  if (cartItemsEl) {
    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<p class="empty-msg">Your cart is empty.</p>`;
    } else {
      cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <h5>${item.name}</h5>
            <p>৳ ${item.price.toLocaleString()} x ${item.qty}</p>
          </div>
          <button class="close-btn" onclick="removeFromCart(${item.id})">
            <i class="fa-solid fa-trash" style="font-size:0.9rem; color: #ff4757;"></i>
          </button>
        </div>
      `).join('');
    }
  }
}

// Drawer Controls
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartDrawer = document.getElementById("cart-drawer");

function openCartDrawer() {
  cartDrawer?.classList.add("active");
  cartOverlay?.classList.add("active");
}

function closeCartDrawer() {
  cartDrawer?.classList.remove("active");
  cartOverlay?.classList.remove("active");
}

cartBtn?.addEventListener("click", openCartDrawer);
closeCartBtn?.addEventListener("click", closeCartDrawer);
cartOverlay?.addEventListener("click", closeCartDrawer);

// ==========================================================================
// 4. HERO CAROUSEL SLIDER
// ==========================================================================
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prev-slide");
const nextBtn = document.getElementById("next-slide");

function showSlide(index) {
  if (slides.length === 0) return;
  slides.forEach(s => s.classList.remove("active"));
  
  if (index >= slides.length) currentSlide = 0;
  else if (index < 0) currentSlide = slides.length - 1;
  else currentSlide = index;

  slides[currentSlide].classList.add("active");
}

nextBtn?.addEventListener("click", () => showSlide(currentSlide + 1));
prevBtn?.addEventListener("click", () => showSlide(currentSlide - 1));

// Auto Slide every 6 seconds
setInterval(() => showSlide(currentSlide + 1), 6000);

// ==========================================================================
// 5. FLOATING CHATBOT WIDGET LOGIC
// ==========================================================================
const chatToggle = document.getElementById("chat-toggle");
const chatClose = document.getElementById("chat-close");
const chatPanel = document.getElementById("chat-panel");
const chatSend = document.getElementById("chat-send");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

chatToggle?.addEventListener("click", () => chatPanel?.classList.toggle("active"));
chatClose?.addEventListener("click", () => chatPanel?.classList.remove("active"));

function handleChatSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Render User Message
  chatMessages.innerHTML += `<div class="msg user-msg">${text}</div>`;
  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Simulated Automated Response
  setTimeout(() => {
    let reply = "Thanks for asking! Our customer support team is available 24/7. Call us at 01819-940370 for immediate assistance.";
    const lower = text.toLowerCase();

    if (lower.includes("delivery") || lower.includes("shipping")) {
      reply = "We offer free nationwide delivery across Bangladesh on orders over ৳2000! Deliveries usually take 24-48 hours.";
    } else if (lower.includes("warranty")) {
      reply = "All our gadgets come with official brand warranty coverage ranging from 1 to 3 years!";
    } else if (lower.includes("keyboard") || lower.includes("mouse")) {
      reply = "Check out our 'New Trends' section above for live stock on mechanical keyboards and gaming mice!";
    }

    chatMessages.innerHTML += `<div class="msg bot-msg">${reply}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 600);
}

chatSend?.addEventListener("click", handleChatSend);
chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleChatSend();
});

// ==========================================================================
// 6. CATEGORY PAGE LOGIC (DYNAMIC FETCH & FILTER)
// ==========================================================================
let categoryRawProducts = [];

async function loadCategoryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  let categoryName = urlParams.get('name');

  const titleEl = document.getElementById('cat-title');
  const grid = document.getElementById('category-products-grid');

  if (!grid) return; // Exit if not on category.html page

  if (!categoryName) {
    categoryName = "All Products";
  }

  // Handle "Audio & Headsets" -> "Audio" matching
  if (categoryName.toLowerCase().includes("audio")) {
    categoryName = "Audio";
  }

  if (titleEl) titleEl.textContent = categoryName;
  document.title = `${categoryName} — GG EZ Gadgets`;

  // Fetch products from server
  const allProducts = await fetchProductsFromAPI();
  
  // Filter products by category (flexible matching)
  categoryRawProducts = allProducts.filter(p => {
    if (!p.category) return false;
    const cat = p.category.trim().toLowerCase();
    const target = categoryName.trim().toLowerCase();
    return cat === target || cat.includes(target) || target.includes(cat);
  });

  renderBrandFilters(categoryRawProducts);
  filterCategoryProducts();
}

function renderBrandFilters(products) {
  const container = document.getElementById('brand-filters');
  if (!container) return;

  const brands = [...new Set(products.map(p => p.brand).filter(b => b && b.trim() !== ''))];
  
  if (brands.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">No brand filters available.</p>`;
    return;
  }

  container.innerHTML = brands.map(brand => `
    <label class="brand-item">
      <input type="checkbox" value="${brand}" onchange="filterCategoryProducts()">
      <span>${brand}</span>
    </label>
  `).join('');
}

function filterCategoryProducts() {
  const grid = document.getElementById('category-products-grid');
  const countBadge = document.getElementById('cat-count-badge');
  const sortVal = document.getElementById('cat-sort')?.value;

  if (!grid) return;

  const checkedBrands = Array.from(document.querySelectorAll('#brand-filters input:checked')).map(cb => cb.value);

  let filtered = [...categoryRawProducts];

  if (checkedBrands.length > 0) {
    filtered = filtered.filter(p => checkedBrands.includes(p.brand));
  }

  if (sortVal === 'low-high') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortVal === 'high-low') {
    filtered.sort((a, b) => b.price - a.price);
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Item(s) Found`;
  }

  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.innerHTML = `<p class="empty-msg" style="grid-column: 1/-1;">No products found in this category.</p>`;
    return;
  }

  filtered.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <a href="product.html?id=${p.id}" class="card-img-wrap" style="display:block;">
          ${p.tag ? `<span class="card-tag ${p.tag === 'HOT' ? 'badge-hot' : 'badge-new'}">${p.tag}</span>` : ''}
          <img src="${p.image}" alt="${p.name}">
        </a>
        <div class="card-info">
          <h3>
            <a href="product.html?id=${p.id}" style="color:inherit; text-decoration:none;">${p.name}</a>
          </h3>
          <div class="card-price-row">
            <span class="price-current">৳ ${p.price.toLocaleString()}</span>
          </div>
          <button class="add-cart-btn" onclick="addToCart(${p.id})">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  });
}

// ==========================================================================
// INITIALIZE ON LOAD
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();
});

function proceedToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const isLoggedIn = localStorage.getItem('customer_logged_in') === 'true';

  if (isLoggedIn) {
    window.location.href = 'checkout.html';
  } else {
    // Redirects to user-auth.html and remembers to return to checkout.html afterward
    window.location.href = 'user-auth.html?redirect=checkout.html';
  }
}

// ==========================================================================
// 7. LIVE NAVBAR SEARCH BAR
// ==========================================================================
let allServerProducts = [];

async function initNavbarSearch() {
  const searchInput = document.getElementById('site-search-input');
  const dropdown = document.getElementById('search-results-dropdown');

  if (!searchInput || !dropdown) return;

  // Pre-fetch products for fast search
  allServerProducts = await fetchProductsFromAPI();

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    // Filter products matching name, category, or brand
    const matches = allServerProducts.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query))
    );

    if (matches.length === 0) {
      dropdown.innerHTML = `<div style="padding: 12px; color: var(--text-muted); text-align: center; font-size: 0.85rem;">No gadgets found</div>`;
    } else {
      dropdown.innerHTML = matches.map(p => `
        <a href="product.html?id=${p.id}" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; text-decoration: none; color: var(--text-main); border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='#1c2033'" onmouseout="this.style.background='transparent'">
          <img src="${p.image}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: contain; background: #0a0b10; border-radius: 6px;">
          <div style="flex: 1; overflow: hidden;">
            <div style="font-size: 0.85rem; font-weight: 600; text-overflow: ellipsis; overflow: hidden; whitespace: nowrap; color: #fff;">${p.name}</div>
            <div style="font-size: 0.8rem; color: var(--accent-yellow); font-weight: 700;">৳ ${p.price.toLocaleString()}</div>
          </div>
        </a>
      `).join('');
    }

    dropdown.style.display = 'block';
  });

  // Close dropdown when clicking anywhere outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

// Call inside DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initNavbarSearch();
});

function handleAccountClick(e) {
  e.preventDefault();
  const isLoggedIn = localStorage.getItem('customer_logged_in') === 'true';
  if (isLoggedIn) {
    window.location.href = 'account.html';
  } else {
    window.location.href = 'user-auth.html';
  }
}
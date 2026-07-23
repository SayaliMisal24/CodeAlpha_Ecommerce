// ===========================
// PAGE LOADER
// ===========================
window.addEventListener('load', function () {
    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
        setTimeout(function () {
            pageLoader.classList.add('loaded');
        }, 400);   // small delay so the spinner is visible briefly, even on fast connections
    }
});
// ===========================
// PRODUCT DATA
// This is our single source of truth for all product info.
// Both the homepage AND product details page use this same list.
// ===========================
let products = [];   // will be filled in by fetching from our backend
// ===========================
// CART DATA & CORE LOGIC
// ===========================

// This array holds all items currently in the cart.
// Each item will be an object like: { id, name, price, image, quantity }
let cart = [];

// Select elements needed to display cart contents
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotalAmount = document.querySelector('.cart-total-amount');
const cartCountBadge = document.querySelector('.cart-count');
// Checks if a user is currently logged in
function isLoggedIn() {
    return localStorage.getItem('novacart_token') !== null;
}
// Function: adds a product to the cart
function addToCart(id, name, price, image) {
    if (!isLoggedIn()) {
        alert('Please log in or create an account to add items to your cart.');
        window.location.href = 'login.html';
        return;
    }

    // Check if this product is ALREADY in the cart
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        // If it's already there, just increase its quantity by 1
        existingItem.quantity += 1;
    } else {
        // Otherwise, add it as a brand new entry with quantity 1
        cart.push({ id, name, price, image, quantity: 1 });
    }

    renderCart();   // re-draws the cart sidebar to show the updated contents
}
// Function: changes an item's quantity, or removes it if it drops to 0
function updateQuantity(id, action) {
    const item = cart.find(item => item.id === id);
    if (!item) return;   // safety check — do nothing if item somehow isn't found

    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCart(id);   // if quantity hits 0, remove the item entirely
            return;
        }
    }
    renderCart();
}

// Function: removes an item from the cart completely
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);   // keeps every item EXCEPT the one matching this id
    renderCart();
}
// Function: saves the current cart array into the browser's Local Storage
function saveCartToStorage() {
    // Local Storage only stores TEXT, so we convert our array into a JSON string
    localStorage.setItem('novacart_cart', JSON.stringify(cart));
}

// Function: loads a previously saved cart from Local Storage (if any exists)
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('novacart_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);   // convert the saved JSON string back into a real array
    }
}
// ===========================
// WISHLIST LOGIC
// ===========================
let wishlist = [];   // array of product IDs the user has liked

function saveWishlistToStorage() {
    localStorage.setItem('novacart_wishlist', JSON.stringify(wishlist));
}

function loadWishlistFromStorage() {
    const saved = localStorage.getItem('novacart_wishlist');
    if (saved) {
        wishlist = JSON.parse(saved);
    }
}

// Updates every heart button on the page to match the current wishlist state
function refreshWishlistIcons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const id = Number(btn.dataset.id);
        if (wishlist.includes(id)) {
            btn.textContent = '❤️';
            btn.classList.add('active');
        } else {
            btn.textContent = '🤍';
            btn.classList.remove('active');
        }
    });
}
// Renders the wishlist page grid (only runs if that grid exists on the current page)
function renderWishlistPage() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    if (!wishlistGrid) return;   // stop here if we're not on the wishlist page

    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = '<p class="cart-empty-msg">Your wishlist is empty. Start adding products you love!</p>';
        return;
    }

    // Get the full product details for each ID saved in the wishlist
    const likedProducts = products.filter(p => wishlist.includes(p.id));

    wishlistGrid.innerHTML = likedProducts.map(product => `
        <div class="product-card">
            <button class="wishlist-btn active" data-id="${product.id}">❤️</button>
            <a href="product.html?id=${product.id}" class="product-link">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <h3 class="product-name">${product.name}</h3>
            </a>
            <div class="product-info">
                <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
                <button class="btn-add-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Toggle a product in/out of the wishlist
function toggleWishlist(id) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(itemId => itemId !== id);   // remove it
    } else {
        wishlist.push(id);   // add it
    }
    saveWishlistToStorage();
    refreshWishlistIcons();
}

// Listen for clicks on ANY wishlist heart button (event delegation, since cards can vary per page)
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('wishlist-btn')) {
        const id = Number(e.target.dataset.id);
        toggleWishlist(id);
    }
});

// Load saved wishlist and update icons as soon as the page opens
loadWishlistFromStorage();
refreshWishlistIcons();
renderWishlistPage();
// Function: re-draws (renders) the entire cart sidebar based on current cart data
function renderCart() {
    saveCartToStorage();
    // If the cart is empty, show the empty message
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
        cartTotalAmount.textContent = '₹0';
        updateCartCount();
        return;   // stop here, nothing more to do
    }

    // Build HTML for each cart item, then join them all together
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">🗑</button>
                </div>
            </div>
        </div>
    `).join('');

    // Calculate total price: sum of (price × quantity) for every item
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalAmount.textContent = `₹${total}`;
    updateCartCount();
}
// Function: updates the little number badge on the cart icon
function updateCartCount() {
    // Sum up the quantity of every item in the cart (not just number of unique products)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalItems;
}

// Attach click behavior to EVERY "Add to Cart" button on the page
// Using event delegation so this works even for buttons added dynamically (like on the wishlist page)
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-add-cart')) {
        const id = e.target.dataset.id;
        const name = e.target.dataset.name;
        const price = Number(e.target.dataset.price);
        const image = e.target.dataset.image;
        addToCart(id, name, price, image);
    }
});
// ===========================
// CART OPEN/CLOSE LOGIC
// ===========================

// Select the elements we need to control
const cartIcon = document.querySelector('.navbar-icons a[aria-label="Cart"]');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartOverlay = document.querySelector('.cart-overlay');
const cartCloseBtn = document.querySelector('.cart-close');

// Function to open the cart
function openCart() {
    cartSidebar.classList.add('active');   // adds the "active" class, triggering our CSS slide-in
    cartOverlay.classList.add('active');   // shows the dark background overlay too
}

// Function to close the cart
function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
}

// When the cart icon is clicked, open the cart
cartIcon.addEventListener('click', function (e) {
    e.preventDefault();   // stops the link from trying to navigate anywhere (since href="#")
    openCart();
});

// When the close (×) button is clicked, close the cart
cartCloseBtn.addEventListener('click', closeCart);

// When the dark overlay is clicked, close the cart too (common UX pattern)
cartOverlay.addEventListener('click', closeCart);
// Event delegation: listen for clicks on the whole cart container,
// then check WHAT was actually clicked inside it
cartItemsContainer.addEventListener('click', function (e) {
    const id = e.target.dataset.id;   // gets the id from whichever element was clicked

    if (e.target.classList.contains('qty-btn')) {
        const action = e.target.dataset.action;
        updateQuantity(id, action);
    }

    if (e.target.classList.contains('remove-btn')) {
        removeFromCart(id);
    }
});
// Load any previously saved cart as soon as the page loads, and display it
loadCartFromStorage();
renderCart();
// ===========================
// MOBILE HAMBURGER MENU
// ===========================
const hamburgerBtn = document.querySelector('.hamburger-btn');
const navLinks = document.querySelector('.nav-links');

hamburgerBtn.addEventListener('click', function () {
    hamburgerBtn.classList.toggle('active');   // toggles the X animation
    navLinks.classList.toggle('active');       // toggles the menu sliding in/out
});
// ===========================
// DARK / LIGHT MODE TOGGLE
// ===========================
const themeToggleBtn = document.querySelector('.theme-toggle');

// Check Local Storage for a previously saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️';   // show a sun icon when already in dark mode
}

themeToggleBtn.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');

    // Update the icon and save the preference
    if (document.body.classList.contains('dark-mode')) {
        themeToggleBtn.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggleBtn.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
});
// ===========================
// PRODUCT DETAILS PAGE
// ===========================

// Only run this code if we're actually on the product details page
// (checks if the quantity display element exists on the current page)
const qtyDisplay = document.getElementById('qtyDisplay');

function loadProductDetails() {
    if (!qtyDisplay) return;
        // Read the "id" value from the page's URL (e.g., product.html?id=3 → gets "3")
    const urlParams = new URLSearchParams(window.location.search);
    const productId = Number(urlParams.get('id'));

    // Find the matching product from our data list

    const currentProduct = products.find(p => p.id === productId);
    const addToCartDetailsBtn = document.getElementById('addToCartDetailsBtn');


    if (currentProduct) {
        // Fill in the page with this product's real details
        document.getElementById('productImage').src = currentProduct.image;
        document.getElementById('productImage').alt = currentProduct.name;
        document.getElementById('productName').textContent = currentProduct.name;
        document.getElementById('productPrice').textContent = `₹${currentProduct.price.toLocaleString('en-IN')}`;
        document.getElementById('productDescription').textContent = currentProduct.description;
        document.getElementById('productCategory').textContent = currentProduct.category;

        // Update the page's browser tab title too
        document.title = `${currentProduct.name} | Novacart`;

        // Update the Add to Cart button's data-* attributes to match THIS product
        addToCartDetailsBtn.dataset.id = currentProduct.id;
        addToCartDetailsBtn.dataset.name = currentProduct.name;
        addToCartDetailsBtn.dataset.price = currentProduct.price;
        addToCartDetailsBtn.dataset.image = currentProduct.image;
    }
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
   
    let selectedQty = 1;   // tracks how many the user wants to add

    increaseBtn.addEventListener('click', function () {
        selectedQty += 1;
        qtyDisplay.textContent = selectedQty;
    });

    decreaseBtn.addEventListener('click', function () {
        if (selectedQty > 1) {   // never let it go below 1
            selectedQty -= 1;
            qtyDisplay.textContent = selectedQty;
        }
    });

    addToCartDetailsBtn.addEventListener('click', function () {
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = Number(this.dataset.price);
        const image = this.dataset.image;

        // Add the item to the cart 'selectedQty' number of times
        for (let i = 0; i < selectedQty; i++) {
            addToCart(id, name, price, image);
        }

        openCart();   // automatically open the cart so the user sees it was added
    });
}
// ===========================
// SEARCH FUNCTIONALITY
// ===========================
const searchToggleBtns = document.querySelectorAll('.search-toggle');
const searchOverlay = document.querySelector('.search-overlay');
const searchInput = document.getElementById('searchInput');
const searchCloseBtn = document.querySelector('.search-close');
const searchResults = document.getElementById('searchResults');

function openSearch() {
    searchOverlay.classList.add('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchInput.focus();   // automatically puts the cursor in the input, ready to type
}

function closeSearch() {
    searchOverlay.classList.remove('active');
}

searchToggleBtns.forEach(btn => {
    btn.addEventListener('click', openSearch);
});

searchCloseBtn.addEventListener('click', closeSearch);

// Also close if clicking the dark background area (not the search box itself)
searchOverlay.addEventListener('click', function (e) {
    if (e.target === searchOverlay) {
        closeSearch();
    }
});

// Runs every time the user types in the search box
searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();

    if (query === '') {
        searchResults.innerHTML = '';
        return;
    }

    // Filter products whose name includes the typed text
    const matches = products.filter(p => p.name.toLowerCase().includes(query));

    if (matches.length === 0) {
        searchResults.innerHTML = '<p class="cart-empty-msg">No products found.</p>';
        return;
    }

    searchResults.innerHTML = matches.map(product => `
        <a href="product.html?id=${product.id}" class="search-result-item">
            <img src="${product.image}" alt="${product.name}">
            <span>${product.name}</span>
            <span class="price">₹${product.price.toLocaleString('en-IN')}</span>
        </a>
    `).join('');
});
// ===========================
// FEATURED PRODUCTS RENDERING + FILTERING
// ===========================
const productsGrid = document.getElementById('productsGrid');

function renderProducts(filter = 'all') {
    if (!productsGrid) return;

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <button class="wishlist-btn" data-id="${product.id}">🤍</button>
            <a href="product.html?id=${product.id}" class="product-link">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <h3 class="product-name">${product.name}</h3>
            </a>
            <div class="product-info">
                <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
                <button class="btn-add-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
            </div>
        </div>
    `).join('');

    refreshWishlistIcons();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderProducts(this.dataset.filter);
    });
});

// Check if a category was passed in the URL (e.g., from a category card click)
const urlCategoryParams = new URLSearchParams(window.location.search);
const categoryFromUrl = urlCategoryParams.get('category');

if (categoryFromUrl) {
    renderProducts(categoryFromUrl);
    // Also mark the matching filter button as active
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === categoryFromUrl);
    });
} else {
    // Fetch products from our backend, THEN render them
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        products = await response.json();

        // Now that we have real product data, render everything that depends on it
        const categoryFromUrl = new URLSearchParams(window.location.search).get('category');
        if (categoryFromUrl) {
            renderProducts(categoryFromUrl);
        } else {
            renderProducts();
        }

        // Also refresh product-details page and wishlist page, if we're on those
        if (typeof loadProductDetails === 'function') loadProductDetails();
        if (typeof renderWishlistPage === 'function') renderWishlistPage();

    } catch (error) {
        console.error('Failed to load products:', error);
        if (productsGrid) {
            productsGrid.innerHTML = '<p class="cart-empty-msg">Could not load products. Please make sure the server is running.</p>';
        }
    }
}

loadProducts();
}
// ===========================
// CHECKOUT PAGE
// ===========================
const checkoutItemsContainer = document.getElementById('checkoutItems');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutForm = document.getElementById('checkoutForm');
// If someone reaches the checkout page directly without logging in, redirect them
if (checkoutForm && !isLoggedIn()) {
    alert('Please log in to continue to checkout.');
    window.location.href = 'login.html';
}
function renderCheckout() {
    if (!checkoutItemsContainer) return;   // only run on the checkout page

    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
        checkoutTotal.textContent = '₹0';
        return;
    }

    checkoutItemsContainer.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="checkout-item-info">
                <h4>${item.name} × ${item.quantity}</h4>
                <p>₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before placing an order.');
            return;
        }

        // Gather the order details to send to our backend
        const orderData = {
            customerName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            pincode: document.getElementById('pincode').value,
            phone: document.getElementById('phone').value,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Order failed');
            }

            alert('Order placed successfully! Thank you for shopping with Novacart.');

            cart = [];
            saveCartToStorage();
            renderCheckout();
            checkoutForm.reset();

        } catch (error) {
            alert('Something went wrong placing your order. Please make sure the server is running and try again.');
            console.error(error);
        }
    });
}

renderCheckout();
// ===========================
// CONTACT FORM
// ===========================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Thank you for reaching out! We\'ll get back to you soon.');
        contactForm.reset();
    });
}
// ===========================
// FAQ ACCORDION
// ===========================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function () {
        const faqItem = this.parentElement;   // the .faq-item div containing this button
        faqItem.classList.toggle('active');
    });
});
// ===========================
// SCROLL ANIMATIONS (Intersection Observer)
// ===========================

// Creates an "observer" that watches elements and tells us when they enter the screen
const scrollObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {   // true when the element becomes visible on screen
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.15   // triggers when 15% of the element is visible
});

// Tell the observer to watch every element with our animation class
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
});
// ===========================
// BACK TO TOP BUTTON
// ===========================
const backToTopBtn = document.getElementById('backToTopBtn');

if (backToTopBtn) {
    // Show/hide the button based on how far the user has scrolled
    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {   // after scrolling down 400px
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Smoothly scroll back to the top when clicked
    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
// ===========================
// AUTHENTICATION (Signup, Login, Logout)
// ===========================
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

// ---- SIGNUP ----
if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const errorEl = document.getElementById('signupError');
        errorEl.textContent = '';

        try {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                errorEl.textContent = data.error;
                return;
            }

            // Save the token and user info so the site remembers this login
            localStorage.setItem('novacart_token', data.token);
            localStorage.setItem('novacart_user', JSON.stringify(data.user));

            window.location.href = 'index.html';   // redirect to homepage after signup

        } catch (error) {
            errorEl.textContent = 'Something went wrong. Please make sure the server is running.';
        }
    });
}

// ---- LOGIN ----
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = '';

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                errorEl.textContent = data.error;
                return;
            }

            localStorage.setItem('novacart_token', data.token);
            localStorage.setItem('novacart_user', JSON.stringify(data.user));

            window.location.href = 'index.html';

        } catch (error) {
            errorEl.textContent = 'Something went wrong. Please make sure the server is running.';
        }
    });
}

// ---- SHOW LOGGED-IN STATE IN NAVBAR ----
function updateAuthUI() {
    const savedUser = localStorage.getItem('novacart_user');
    const authLink = document.getElementById('authLink');
    if (!authLink) return;

    if (savedUser) {
        const user = JSON.parse(savedUser);
        authLink.textContent = `Hi, ${user.name.split(' ')[0]}`;   // shows just their first name
        authLink.href = '#';
        authLink.onclick = function (e) {
            e.preventDefault();
            if (confirm('Log out of Novacart?')) {
                localStorage.removeItem('novacart_token');
                localStorage.removeItem('novacart_user');
                window.location.href = 'index.html';
            }
        };
    } else {
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
        authLink.onclick = null;
    }
}

updateAuthUI();
// ===========================
// SELL / ADD PRODUCT FORM
// ===========================
const sellForm = document.getElementById('sellForm');

if (sellForm) {
    // Block this page entirely if not logged in
    if (!isLoggedIn()) {
        alert('Please log in to list a product for sale.');
        window.location.href = 'login.html';
    }

    sellForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const errorEl = document.getElementById('sellError');
        const successEl = document.getElementById('sellSuccess');
        errorEl.textContent = '';
        successEl.textContent = '';

        const productData = {
            name: document.getElementById('sellName').value,
            price: document.getElementById('sellPrice').value,
            category: document.getElementById('sellCategory').value,
            image: document.getElementById('sellImage').value,
            description: document.getElementById('sellDescription').value
        };

        const token = localStorage.getItem('novacart_token');

        try {
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`   // sends our login token so the backend knows who we are
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (!response.ok) {
                errorEl.textContent = data.error;
                return;
            }

            successEl.textContent = 'Product listed successfully! Redirecting to homepage...';
            sellForm.reset();

            setTimeout(function () {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            errorEl.textContent = 'Something went wrong. Please make sure the server is running.';
        }
    });
}
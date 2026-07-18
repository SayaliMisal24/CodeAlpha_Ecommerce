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

// Function: adds a product to the cart
function addToCart(id, name, price, image) {
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
document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', function () {
        // Read the product's info from its data-* attributes
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = Number(this.dataset.price);   // convert text to a number
        const image = this.dataset.image;

        addToCart(id, name, price, image);
    });
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
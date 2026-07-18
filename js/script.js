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

// Function: re-draws (renders) the entire cart sidebar based on current cart data
function renderCart() {
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
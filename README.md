# Novacart — Full-Stack E-Commerce Platform

A complete, full-stack e-commerce web application built from scratch — from static HTML/CSS/JS through a live, deployed Node.js/Express backend with a real MongoDB database, authentication, and multi-vendor selling.

**Live site:** https://codealpha-ecommerce-novacart.netlify.app/
**Backend API:** https://codealpha-ecommerce-novacart-backend.onrender.com

---

## Features

### Storefront
- Responsive navbar with hamburger menu, dark/light mode, live search, and category filters
- Hero section, "Shop by Category," and a dynamic, database-driven product grid
- Product details pages with quantity selector and customer reviews
- Wishlist, shopping cart (persisted with Local Storage), and a full checkout flow
- FAQ accordion, testimonials, About/Contact pages, scroll animations, and a loading screen

### Accounts & Roles
- Signup/login with hashed passwords (bcrypt) and JWT-based sessions
- Two account types: **Customer** and **Seller**
- Login required before adding to cart or checking out
- Profile dropdown menu with Order History, My Reviews, and Logout

### Multi-Vendor Selling
- Seller accounts can list their own products, with photo uploads (via Cloudinary)
- Sellers can view and delete their own listings ("My Listings")

### Orders & Reviews
- Real order processing — orders are saved to MongoDB with shipping details and items
- Order history for logged-in customers
- Product reviews and star ratings, stored per product and per user

---

## Tech Stack

**Frontend:** HTML5, CSS3 (custom properties for theming), vanilla JavaScript (ES6)
**Backend:** Node.js, Express.js
**Database:** MongoDB (Atlas)
**Auth:** bcrypt.js (password hashing), JSON Web Tokens (JWT)
**Image hosting:** Cloudinary (via Multer)
**Deployment:** Netlify (frontend), Render (backend)

---

## Project Structure

```
CodeAlpha_Ecommerce/
├── index.html, product.html, checkout.html, ...   # Frontend pages
├── css/style.css                                   # All styling (CSS variables for theming)
├── js/script.js                                     # All frontend logic
├── assets/                                           # Static assets
└── backend/
    ├── server.js                                     # Express server & all API routes
    ├── seed.js                                        # One-time script to seed sample products
    └── .env                                           # Environment variables (not committed)
```

---

## Running Locally

1. Clone the repo and install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file inside `backend/` with:
   ```bash
MONGO_URI=mongodb+srv://misalsayali24_db_user:AdpJ5byL4NdZ8C0G@cluster1.go7zb22.mongodb.net/?appName=Cluster1
JWT_SECRET=novacart_super_secret_key_2026
CLOUDINARY_CLOUD_NAME=yapcqsyy
CLOUDINARY_API_KEY=673411879631918
CLOUDINARY_API_SECRET=XLi1A7MKrIWbWIQL22-l_cv23dY
   ```
3. Start the backend:
   ```bash
   node server.js
   ```
4. Open `index.html` with a local server (e.g., VS Code's Live Server extension).

---

## Notes

This project was built as part of the CodeAlpha Full Stack Development internship task ("Simple E-Commerce Store"), and extended well beyond the base requirements with role-based accounts, multi-vendor selling, and product reviews.

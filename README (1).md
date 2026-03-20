# 🛒 ShopAPI — Full Stack E-Commerce Application

A full-stack E-Commerce Application built with Node.js, Express, MySQL, and React. This system allows customers to browse products, manage their cart, and place orders — while admins can manage products, categories, and update order statuses in real time.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#️-database-schema)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Role Based Access](#-role-based-access)
- [Order Status Flow](#-order-status-flow)
- [Authentication](#-authentication)
- [Built By](#-built-by)

---

## ✨ Features

### Admin
- 📦 Full product management (add, edit, delete, image upload)
- 🗂️ Category management (add, delete)
- 📋 View all customer orders
- 🔄 Update order status (pending → processing → shipped → delivered)
- 🗑️ Delete products with auto image cleanup

### Customer
- 🛍️ Browse all products with search filter
- 📄 View product detail with stock info
- 🛒 Add to cart with quantity selection
- 💳 Place orders directly from cart
- 📦 View personal order history with status badges
- 🔐 Register and login with JWT authentication

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MySQL | Database |
| mysql2 | MySQL driver with promise support |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| multer | Image/file upload handling |
| dotenv | Environment variables |
| cors | Cross-origin requests |
| nodemon | Development auto-restart |

### Frontend

| Technology | Purpose |
|------------|---------|
| React.js | UI library |
| Vite | Build tool and dev server |
| Tailwind CSS v3 | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Context API | Global auth state management |

---

## 📁 Project Structure

```
shopapp/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, GetMe
│   │   ├── categoryController.js  # Category CRUD
│   │   ├── productController.js   # Product CRUD + image upload
│   │   ├── cartController.js      # Cart management
│   │   └── orderController.js     # Order placement and tracking
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + adminOnly guard
│   │   ├── uploadMiddleware.js    # Multer image upload config
│   │   └── errorHandler.js        # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── uploads/                   # Uploaded product images
│   ├── index.js                   # Express app entry point
│   ├── .env                       # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance + token interceptor
    │   ├── components/
    │   │   ├── Navbar.jsx         # Auth-aware navigation bar
    │   │   ├── ProductCard.jsx    # Product grid card component
    │   │   └── ProtectedRoute.jsx # Route guard component
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global user + token state
    │   ├── pages/
    │   │   ├── Home.jsx           # Product listing with search
    │   │   ├── Login.jsx          # Login form
    │   │   ├── Register.jsx       # Registration form
    │   │   ├── ProductDetail.jsx  # Product info + Add to Cart
    │   │   ├── Cart.jsx           # Cart + Place Order
    │   │   ├── Orders.jsx         # Order history
    │   │   └── Admin.jsx          # Admin dashboard
    │   ├── App.jsx                # All route definitions
    │   └── index.css              # Tailwind CSS directives
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🗄️ Database Schema

### `shopapi_db`

```
├── users              # Customer and admin accounts
├── categories         # Product categories (Electronics, Clothing, etc.)
├── products           # Products with price and stock
├── product_images     # Product images (one product → many images)
├── carts              # One cart per user
├── cart_items         # Individual items inside each cart
├── orders             # Orders placed by customers
└── order_items        # Individual items within each order (price snapshot)
```

### Relationships

```
users ──────────────────< orders ──────────< order_items >────── products
  │                                                                   │
  └──────────────────────< carts ──────────< cart_items  >───────────┘
                                                                       │
categories >───────────────────────────────────────────────────────────┘
                                                                       │
product_images >───────────────────────────────────────────────────────┘
```

### Table Definitions

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (bcrypt hashed) |
| role | ENUM | 'customer' or 'admin', DEFAULT 'customer' |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### `categories`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### `products`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| category_id | INT | FK → categories.id ON DELETE SET NULL |
| name | VARCHAR(200) | NOT NULL |
| description | TEXT | NULL |
| price | DECIMAL(10,2) | NOT NULL |
| stock | INT | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### `product_images`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| product_id | INT | FK → products.id ON DELETE CASCADE |
| image_url | VARCHAR(255) | NOT NULL |

#### `carts`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| user_id | INT | FK → users.id, UNIQUE (one cart per user) |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### `cart_items`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| cart_id | INT | FK → carts.id ON DELETE CASCADE |
| product_id | INT | FK → products.id ON DELETE CASCADE |
| quantity | INT | DEFAULT 1 |

#### `orders`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| user_id | INT | FK → users.id ON DELETE CASCADE |
| total_amount | DECIMAL(10,2) | NOT NULL |
| status | ENUM | 'pending','processing','shipped','delivered','cancelled' |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### `order_items`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| order_id | INT | FK → orders.id ON DELETE CASCADE |
| product_id | INT | FK → products.id ON DELETE CASCADE |
| quantity | INT | NOT NULL |
| price | DECIMAL(10,2) | NOT NULL — price snapshot at time of order |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MySQL 8.0+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/shopapi.git
cd shopapi
```

### 2. Setup the database

Open MySQL Workbench and run:

```sql
CREATE DATABASE IF NOT EXISTS shopapi_db;
USE shopapi_db;

CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  stock       INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE product_images (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url  VARCHAR(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE carts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  cart_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT DEFAULT 1,
  FOREIGN KEY (cart_id)    REFERENCES carts(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status       ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

Seed sample data:

```sql
INSERT INTO categories (name) VALUES ('Electronics'), ('Clothing'), ('Books');

INSERT INTO products (category_id, name, description, price, stock) VALUES
  (1, 'Wireless Headphones', 'Noise cancelling Bluetooth headphones', 2999.00, 50),
  (1, 'USB-C Hub',           '7-in-1 USB-C hub for laptops',          1499.00, 100),
  (2, 'Cotton T-Shirt',      'Premium 100% cotton t-shirt',            499.00, 200),
  (3, 'Node.js Book',        'Complete Node.js developer guide',        799.00, 30);
```

### 3. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shopapi_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 4. Setup the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Categories

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/categories` | Get all categories | Public |
| POST | `/api/categories` | Create category | Admin only |
| DELETE | `/api/categories/:id` | Delete category | Admin only |

### Products

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products with images | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create product + image upload | Admin only |
| PUT | `/api/products/:id` | Update product | Admin only |
| DELETE | `/api/products/:id` | Delete product | Admin only |

### Cart

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/cart` | View my cart | Protected |
| POST | `/api/cart/add` | Add item to cart | Protected |
| PUT | `/api/cart/update/:id` | Update item quantity | Protected |
| DELETE | `/api/cart/remove/:id` | Remove item from cart | Protected |
| DELETE | `/api/cart/clear` | Clear entire cart | Protected |

### Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Place order from cart | Protected |
| GET | `/api/orders` | My order history | Protected |
| GET | `/api/orders/all` | All customers' orders | Admin only |
| GET | `/api/orders/:id` | Single order with items | Protected |
| PUT | `/api/orders/:id/status` | Update order status | Admin only |

---

## 👥 Role Based Access

### Admin
- Full access to all endpoints
- Can manage products, categories
- Can view all customers' orders
- Can update order status
- Can delete any product or category

### Customer
- Can browse products and categories
- Can manage their own cart
- Can place orders and view their own order history
- Cannot access admin-only endpoints

---

## 🔄 Order Status Flow

```
pending → processing → shipped → delivered
                              ↘ cancelled
```

- When an order is **placed** → cart is automatically cleared
- When an order is **placed** → product stock is automatically reduced
- The `order_items.price` stores a **price snapshot** at time of purchase

---

## 🔐 Authentication

This project uses **JWT (JSON Web Token)** authentication.

- Register or Login → receive a token
- Include the token in every protected request header:

```
Authorization: Bearer <your_token>
```

- Token expires in **7 days**

### Make a User Admin

```sql
USE shopapi_db;
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Then **logout and login again** to get a new token with the admin role.

---

## 👨‍💻 Built By

**Madhavan**

- GitHub: [@your-username](https://github.com/your-username)

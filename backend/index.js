const db = require('./config/db');  // ← ADD THIS LINE FIRST
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); 
const cartRoutes    = require('./routes/cartRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const errorHandler  = require('./middleware/errorHandler');

const app = express();

// ── Middleware ─────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// ── Routes ────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);

// ── Health Check ──────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🛒 ShopAPI is running!' });
});

// ── Error Handler ─────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
const db = require('../config/db');

// ── Helper: get or create cart for logged-in user ──────
const getOrCreateCart = async (userId) => {
  let [rows] = await db.query(
    'SELECT id FROM carts WHERE user_id = ?', [userId]
  );

  if (rows.length === 0) {
    const [result] = await db.query(
      'INSERT INTO carts (user_id) VALUES (?)', [userId]
    );
    return result.insertId;
  }

  return rows[0].id;
};

// ── GET my cart ────────────────────────────────────────
// GET /api/cart
const getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);

    // Get all items in cart with product details
    const [items] = await db.query(`
  SELECT
    ci.id       AS cart_item_id,
    ci.quantity,
    p.id        AS product_id,
    p.name,
    p.price,
    p.stock,
    (ci.quantity * p.price) AS subtotal,
    (SELECT image_url FROM product_images
     WHERE product_id = p.id LIMIT 1) AS image
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.cart_id = ?
`, [cartId]);

    // Calculate total
    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    res.status(200).json({
      success: true,
      cartId,
      total: total.toFixed(2),
      itemCount: items.length,
      items
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADD item to cart ───────────────────────────────────
// POST /api/cart/add
// Body: { product_id, quantity }
const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({
      success: false,
      message: 'product_id is required'
    });
  }

  try {
    // 1. Check product exists and has enough stock
    const [products] = await db.query(
      'SELECT id, name, stock FROM products WHERE id = ?',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (products[0].stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${products[0].stock} items in stock`
      });
    }

    // 2. Get or create cart
    const cartId = await getOrCreateCart(req.user.id);

    // 3. Check if product already in cart
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, product_id]
    );

    if (existing.length > 0) {
      // Update quantity instead of adding duplicate
      const newQty = existing[0].quantity + Number(quantity);
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQty, existing[0].id]
      );
    } else {
      // Insert new cart item
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, product_id, quantity]
      );
    }

    res.status(200).json({
      success: true,
      message: `${products[0].name} added to cart`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE item quantity ───────────────────────────────
// PUT /api/cart/update/:id
// Body: { quantity }
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cartItemId   = req.params.id;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.status(200).json({ success: true, message: 'Cart updated' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── REMOVE single item from cart ───────────────────────
// DELETE /api/cart/remove/:id
const removeCartItem = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM cart_items WHERE id = ?', [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.status(200).json({ success: true, message: 'Item removed from cart' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CLEAR entire cart ──────────────────────────────────
// DELETE /api/cart/clear
const clearCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);

    await db.query(
      'DELETE FROM cart_items WHERE cart_id = ?', [cartId]
    );

    res.status(200).json({ success: true, message: 'Cart cleared' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
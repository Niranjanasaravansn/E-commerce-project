const db = require('../config/db');

// ── PLACE ORDER from cart ──────────────────────────────
// POST /api/orders
const placeOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Find user's cart
    const [carts] = await db.query(
      'SELECT id FROM carts WHERE user_id = ?', [userId]
    );

    if (carts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No cart found. Add items first.'
      });
    }

    const cartId = carts[0].id;

    // 2. Get all items in the cart
    const [cartItems] = await db.query(`
      SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items before placing order.'
      });
    }

    // 3. Check stock for every item
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${item.name}". Available: ${item.stock}`
        });
      }
    }

    // 4. Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    // 5. Create the order
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
      [userId, totalAmount.toFixed(2)]
    );

    const orderId = orderResult.insertId;

    // 6. Save each item into order_items (price snapshot)
    for (const item of cartItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      // 7. Reduce product stock
      await db.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // 8. Clear the cart after order placed
    await db.query(
      'DELETE FROM cart_items WHERE cart_id = ?', [cartId]
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      totalAmount: totalAmount.toFixed(2),
      itemCount: cartItems.length
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET my orders ──────────────────────────────────────
// GET /api/orders
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT
        o.id, o.total_amount, o.status, o.created_at,
        COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET single order detail ────────────────────────────
// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    // Get order header
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get all items in this order
    const [items] = await db.query(`
      SELECT
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) AS subtotal,
        p.id   AS product_id,
        p.name AS product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.status(200).json({
      success: true,
      order: {
        ...orders[0],
        items
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE order status (admin) ────────────────────────
// PUT /api/orders/:id/status
// Body: { status }
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Use: ${validStatuses.join(', ')}`
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// GET all orders — admin only
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT
        o.id, o.total_amount, o.status, o.created_at,
        u.name  AS customer_name,
        u.email AS customer_email,
        COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN users u        ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id      = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
};
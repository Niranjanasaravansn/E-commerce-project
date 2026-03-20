const db = require('../config/db');

// GET all products — with category name + images
const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT
        p.id, p.name, p.description, p.price, p.stock,
        c.name AS category,
        GROUP_CONCAT(pi.image_url) AS images
      FROM products p
      LEFT JOIN categories c   ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    // Convert images string to array
    const data = products.map(p => ({
      ...p,
      images: p.images ? p.images.split(',') : []
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single product by ID
const getProductById = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT
        p.id, p.name, p.description, p.price, p.stock,
        c.name AS category,
        GROUP_CONCAT(pi.image_url) AS images
      FROM products p
      LEFT JOIN categories c      ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [req.params.id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = {
      ...products[0],
      images: products[0].images ? products[0].images.split(',') : []
    };

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create product + upload image
const createProduct = async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: 'Product name and price are required'
    });
  }

  try {
    // 1. Insert product
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, stock || 0, category_id || null]
    );

    const productId = result.insertId;

    // 2. If image was uploaded, save its URL to product_images
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await db.query(
        'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
        [productId, imageUrl]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update product
const updateProduct = async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE products
       SET name=?, description=?, price=?, stock=?, category_id=?
       WHERE id=?`,
      [name, description, price, stock, category_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If a new image was uploaded, add it
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await db.query(
        'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
        [req.params.id, imageUrl]
      );
    }

    res.status(200).json({ success: true, message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM products WHERE id = ?', [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
const db = require('../config/db');

// GET all categories — public
const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create category — admin only
const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM categories WHERE name = ?', [name]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name) VALUES (?)', [name]
    );

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: { id: result.insertId, name }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE category — admin only
const deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM categories WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCategories, createCategory, deleteCategory };
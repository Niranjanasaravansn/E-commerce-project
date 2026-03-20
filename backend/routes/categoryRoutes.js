const express = require('express');
const router  = express.Router();
const {
  getAllCategories,
  createCategory,
  deleteCategory
} = require('../controllers/categoryController');
const protect = require('../middleware/authMiddleware');

router.get('/',       getAllCategories);           // public
router.post('/',      protect, createCategory);    // login required
router.delete('/:id', protect, deleteCategory);    // login required

module.exports = router;
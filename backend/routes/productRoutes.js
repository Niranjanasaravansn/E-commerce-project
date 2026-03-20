const express = require('express');
const router  = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');

router.get('/',      getAllProducts);                          // public
router.get('/:id',   getProductById);                         // public
router.post('/',     protect, upload.single('image'), createProduct);  // login + image
router.put('/:id',   protect, upload.single('image'), updateProduct);  // login + image
router.delete('/:id',protect, deleteProduct);                 // login required

module.exports = router;
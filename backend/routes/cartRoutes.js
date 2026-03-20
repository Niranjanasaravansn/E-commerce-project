const express = require('express');
const router  = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');
const protect = require('../middleware/authMiddleware');

// All cart routes are protected — user must be logged in
router.get('/',            protect, getCart);        // view cart
router.post('/add',        protect, addToCart);      // add item
router.put('/update/:id',  protect, updateCartItem); // change qty
router.delete('/remove/:id', protect, removeCartItem); // remove item
router.delete('/clear',    protect, clearCart);      // empty cart

module.exports = router;
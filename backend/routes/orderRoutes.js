const express = require('express');
const router  = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const protect       = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/authMiddleware');

router.post('/',          protect,              placeOrder);
router.get('/all',        protect, adminOnly,   getAllOrders);
router.get('/',           protect,              getMyOrders);
router.get('/:id',        protect,              getOrderById);
router.put('/:id/status', protect, adminOnly,   updateOrderStatus);

module.exports = router;
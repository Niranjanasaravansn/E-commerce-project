import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Cart = () => {
  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/remove/${id}`);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const updateQty = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/cart/update/${id}`, { quantity: newQty });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Remove all items from cart?')) return;
    try {
      await api.delete('/cart/clear');
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const placeOrder = async () => {
    try {
      const res = await api.post('/orders');
      setMessage(`Order #${res.data.orderId} placed! Total: ₹${Number(res.data.totalAmount).toLocaleString()}`);
      fetchCart();
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Order failed');
    }
  };

  if (loading) return (
    <div className="text-center py-20 text-gray-400">Loading cart...</div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>

      {/* Success message */}
      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Empty cart */}
      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
          <button onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700">
            Shop Now
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.items.map(item => (
              <div key={item.cart_item_id}
                className="bg-white rounded-xl shadow p-4 flex items-center gap-4">

                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-purple-600 font-bold mt-1">
                    ₹{Number(item.subtotal).toLocaleString()}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.cart_item_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold flex items-center justify-center">
                      −
                    </button>
                    <span className="text-sm font-medium w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.cart_item_id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold flex items-center justify-center">
                      +
                    </button>
                  </div>
                </div>

                {/* Remove button */}
                <button onClick={() => removeItem(item.cart_item_id)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium">
                  Remove
                </button>

              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600 text-base">
                Items: {cart.itemCount}
              </span>
              <span className="text-2xl font-bold text-purple-600">
                Total: ₹{Number(cart.total).toLocaleString()}
              </span>
            </div>

            {/* Buttons — stacked vertically */}
            <div className="flex flex-col gap-3">
              <button onClick={placeOrder}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
                Place Order
              </button>
              <button onClick={clearCart}
                className="w-full border border-red-300 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition">
                Clear Cart
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default Cart;
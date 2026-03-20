import { useState, useEffect } from 'react';
import api from '../api/axios';

const statusColors = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const Orders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const viewDetail = async (id) => {
    if (selected?.id === id) return setSelected(null);
    try {
      const res = await api.get(`/orders/${id}`);
      setSelected(res.data.order);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-lg">No orders yet</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow overflow-hidden">
              {/* Order Header */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Order #{order.id}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(order.created_at).toLocaleDateString()} · {order.item_count} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-purple-600">
                    ₹{Number(order.total_amount).toLocaleString()}
                  </span>
                  <button onClick={() => viewDetail(order.id)}
                    className="text-purple-600 text-sm hover:underline font-medium">
                    {selected?.id === order.id ? 'Hide' : 'Details'}
                  </button>
                </div>
              </div>

              {/* Order Detail */}
              {selected?.id === order.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-3">Items ordered:</p>
                  <div className="space-y-2">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="text-gray-600 font-medium">
                          ₹{Number(item.subtotal).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
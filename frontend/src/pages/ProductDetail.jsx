import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [product, setProduct]   = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const addToCart = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post('/cart/add', { product_id: product.id, quantity });
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* Image */}
        <div className="h-80 bg-gray-100 rounded-xl overflow-hidden">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0].startsWith('http')
               ? product.images[0]
               : `http://localhost:5000${product.images[0]}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full font-medium">
              {product.category || 'General'}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">{product.description}</p>
            <p className="text-3xl font-bold text-purple-600 mb-2">
              ₹{Number(product.price).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>

          <div className="mt-6">
            {message && (
              <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg mb-3 text-sm">
                {message}
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <input
                type="number" min="1" max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
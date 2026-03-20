import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const emptyForm = { name: '', price: '', stock: '', category_id: '', description: '', image_url: '' };

const Admin = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab]                 = useState('orders');
  const [orders, setOrders]           = useState([]);
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [message, setMessage]         = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user]);

  useEffect(() => {
    if (tab === 'orders')     fetchAllOrders();
    if (tab === 'products')   { fetchProducts(); fetchCategories(); }
    if (tab === 'categories') fetchCategories();
  }, [tab]);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data.orders);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || res.data);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setMessage(`Order #${orderId} updated to "${status}"`);
      fetchAllOrders();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage('Product deleted');
      fetchProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    }
  };

  const openAddForm = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setEditProduct(p);
    setForm({
      name:        p.name,
      price:       p.price,
      stock:       p.stock,
      category_id: p.category_id || '',
      description: p.description || '',
      image_url:   p.image_url || '',
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.stock) {
      setMessage('Please fill name, price and stock');
      return;
    }
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, form);
        setMessage('Product updated successfully!');
      } else {
        await api.post('/products', form);
        setMessage('Product added successfully!');
      }
      setShowForm(false);
      setEditProduct(null);
      setForm(emptyForm);
      fetchProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save product');
    }
  };

  // ── Add Category ───────────────────────────────────
  const addCategory = async () => {
    if (!newCategory.trim()) {
      setMessage('Please enter a category name');
      return;
    }
    try {
      await api.post('/categories', { name: newCategory });
      setMessage('Category added successfully!');
      setNewCategory('');
      fetchCategories();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add category');
    }
  };

  // ── Delete Category ────────────────────────────────
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setMessage('Category deleted!');
      fetchCategories();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <span className="bg-orange-100 text-orange-600 text-sm px-3 py-1 rounded-full font-medium">
          Admin
        </span>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['orders', 'products', 'categories'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition capitalize ${
              tab === t
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-400'
            }`}>
            Manage {t}
          </button>
        ))}
      </div>

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">All Customer Orders</h2>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No orders yet</div>
          ) : (
            orders.map(order => (
              <div key={order.id}
                className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">Order #{order.id}</p>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {order.customer_name}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {new Date(order.created_at).toLocaleDateString()} · {order.item_count} items
                  </p>
                  <p className="text-purple-600 font-bold mt-1">
                    ₹{Number(order.total_amount).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                  <select defaultValue={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer bg-white">
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">All Products</h2>
            <button onClick={openAddForm}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
              + Add Product
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl shadow p-6 mb-6 border border-purple-100">
              <h3 className="text-base font-semibold text-gray-700 mb-4">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Wireless Headphones"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price (₹) *</label>
                  <input name="price" value={form.price} onChange={handleChange}
                    type="number" placeholder="e.g. 1499"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Stock *</label>
                  <input name="stock" value={form.stock} onChange={handleChange}
                    type="number" placeholder="e.g. 50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Category</label>
                  <select name="category_id" value={form.category_id} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Image URL</label>
                  <input name="image_url" value={form.image_url} onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <input name="description" value={form.description} onChange={handleChange}
                    placeholder="Short product description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleSubmit}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                  {editProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button onClick={() => { setShowForm(false); setEditProduct(null); setForm(emptyForm); }}
                  className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400">Loading...</td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category || '—'}</td>
                    <td className="px-4 py-3 text-purple-600 font-semibold">
                      ₹{Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.stock > 10 ? 'bg-green-100 text-green-700'
                        : p.stock > 0 ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {p.stock} left
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <button onClick={() => openEditForm(p)}
                        className="text-blue-500 hover:text-blue-700 font-medium text-sm">
                        Edit
                      </button>
                      <button onClick={() => deleteProduct(p.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {tab === 'categories' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Manage Categories
          </h2>

          {/* Add Category */}
          <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Add New Category
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Furniture"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button onClick={addCategory}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                + Add
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Category Name</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-10 text-gray-400">
                      No categories yet
                    </td>
                  </tr>
                ) : categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">{cat.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data.data);
        setCategories(catRes.data.data || catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter by search AND category
  const filtered = products.filter(p => {
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Products</h1>
        <p className="text-gray-500">Browse our collection</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* All button */}
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
            activeCategory === 'All'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
          }`}>
          All
        </button>

        {/* Dynamic category buttons from DB */}
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
              activeCategory === cat.name
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
            }`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-lg">
          Loading products...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-lg">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Home;

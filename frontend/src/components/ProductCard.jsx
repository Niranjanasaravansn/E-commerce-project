import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col">
      <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0].startsWith('http')
            ? product.images[0]
            : `http://localhost:5000${product.images[0]}`}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="flex-1">
        <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
          {product.category || 'General'}
        </span>
        <h3 className="text-gray-800 font-semibold mt-2 mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-purple-600 font-bold text-lg">
          ₹{Number(product.price).toLocaleString()}
        </span>
        <Link to={`/products/${product.id}`}
          className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700">
          View
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
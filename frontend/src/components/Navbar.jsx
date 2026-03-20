import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-purple-600">
        ShopAPI
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-600 hover:text-purple-600 font-medium">
          Products
        </Link>
        {user ? (
          <>
            <Link to="/cart" className="text-gray-600 hover:text-purple-600 font-medium">
              Cart
            </Link>
            <Link to="/orders" className="text-gray-600 hover:text-purple-600 font-medium">
              Orders
            </Link>

            {/* Admin link — only visible to admins */}
            {user.role === 'admin' && (
              <Link to="/admin" className="text-orange-500 hover:text-orange-600 font-medium">
                Admin
              </Link>
            )}

            <span className="text-gray-500 text-sm flex items-center gap-1">
              Hi, {user.name}
              {user.role === 'admin' && (
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </span>

            <button onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-purple-600 font-medium">
              Login
            </Link>
            <Link to="/register"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

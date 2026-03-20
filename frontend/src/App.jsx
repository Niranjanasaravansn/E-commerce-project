import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import Navbar            from './components/Navbar';
import ProtectedRoute    from './components/ProtectedRoute';
import Home              from './pages/Home';
import Login             from './pages/Login';
import Register          from './pages/Register';
import ProductDetail     from './pages/ProductDetail';
import Cart              from './pages/Cart';
import Orders            from './pages/Orders';
import Admin             from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart"   element={
              <ProtectedRoute><Cart /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="/admin"  element={
              <ProtectedRoute><Admin /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { useState } from 'react';

const Navbar = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to={`/`}>
            <h1 className="text-xl sm:text-2xl font-bold">FLY</h1>

            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm lg:text-base transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/all" 
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm lg:text-base transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              All Products
            </NavLink>
            {/* <NavLink 
              to="/add" 
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm lg:text-base transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              Add Product
            </NavLink> */}
            <NavLink 
              to="/pincode" 
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm lg:text-base transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              Pincode
            </NavLink>
            <NavLink 
              to="/orders" 
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm lg:text-base transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              Orders
            </NavLink>
            {isLoggedIn ? (
              <button 
                onClick={handleLogout} 
                className="px-3 py-2 bg-white text-blue-800 rounded text-sm lg:text-base hover:bg-blue-700 hover:text-white transition-colors duration-200"
              >
                Logout
              </button>
            ) : (
              <NavLink 
                to="/login" 
                className="px-3 py-2 bg-white text-blue-800 rounded text-sm lg:text-base hover:bg-blue-700 hover:text-white transition-colors duration-200"
              >
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-900 rounded-lg mt-2">
            <NavLink 
              to="/" 
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/all" 
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              All Products
            </NavLink>
            <NavLink 
              to="/add" 
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              Add Product
            </NavLink>
            <NavLink 
              to="/pincode" 
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              Pincode
            </NavLink>
            <NavLink 
              to="/orders" 
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`
              }
            >
              Orders
            </NavLink>
            <div className="pt-2 border-t border-blue-700">
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-3 py-2 rounded text-base font-medium bg-white text-blue-800 hover:bg-blue-700 hover:text-white transition-colors duration-200"
                >
                  Logout
                </button>
              ) : (
                <NavLink 
                  to="/login" 
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 rounded text-base font-medium bg-white text-blue-800 hover:bg-blue-700 hover:text-white transition-colors duration-200"
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
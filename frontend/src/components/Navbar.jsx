import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, User, Menu, X, ChevronDown, UserCircle, Package, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if user is logged in - Fixed JSON parsing
  const isLoggedIn = localStorage.getItem('token') !== null;
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      // Check for null, empty string, or "undefined" string
      if (!userData || userData === 'null' || userData === 'undefined') {
        return {};
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      return {};
    }
  };
  const user = getUserData();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsProfileDropdownOpen(false);
    navigate('/');
    alert('Logged out successfully!');
  };

  const getDesktopLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'text-fuchsia-600 font-bold'
        : 'text-gray-700 hover:text-fuchsia-600'
    }`;

  const getMobileLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? 'text-fuchsia-600 bg-fuchsia-50 font-bold'
        : 'text-gray-700 hover:text-fuchsia-600 hover:bg-gray-100'
    }`;

  const MobileNavLink = ({ to, children }) => (
    <li>
      <NavLink to={to} onClick={closeMenu} className={getMobileLinkClass}>
        {children}
      </NavLink>
    </li>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" onClick={closeMenu} className="text-2xl font-bold text-fuchsia-600">
              FLY
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <ul className="ml-10 flex items-baseline space-x-4">
              <li><NavLink to="/" className={getDesktopLinkClass}>Home</NavLink></li>
              <li><NavLink to="/collection" className={getDesktopLinkClass}>Collection</NavLink></li>
              <li><NavLink to="/about" className={getDesktopLinkClass}>About</NavLink></li>
              <li><NavLink to="/contact" className={getDesktopLinkClass}>Contact</NavLink></li>
            </ul>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-5">
            <NavLink to="/wish" className={({isActive}) => isActive ? 'text-fuchsia-600' : 'text-gray-700 hover:text-fuchsia-600'}>
              <Heart size={24} />
            </NavLink>
            <NavLink to="/cart" className={({isActive}) => isActive ? 'text-fuchsia-600' : 'text-gray-700 hover:text-fuchsia-600'}>
              <ShoppingCart size={24} />
            </NavLink>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {isLoggedIn ? (
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-1 text-gray-700 hover:text-fuchsia-600 focus:outline-none"
                >
                  <User size={24} />
                  <ChevronDown size={16} className={`transform transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <NavLink to="/login" className={({isActive}) => isActive ? 'text-fuchsia-600' : 'text-gray-700 hover:text-fuchsia-600'}>
                  <User size={24} />
                </NavLink>
              )}

              {/* Dropdown Menu */}
              {isLoggedIn && isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                  </div>
                  
                  {/* Profile Link */}
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-fuchsia-600 transition-colors duration-200"
                  >
                    <UserCircle size={16} className="mr-3" />
                    Profile
                  </Link>
                  
                  {/* Orders Link */}
                  <Link
                    to="/order"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-fuchsia-600 transition-colors duration-200"
                  >
                    <Package size={16} className="mr-3" />
                    Orders
                  </Link>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors duration-200"
                  >
                    <LogOut size={16} className="mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-fuchsia-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-fuchsia-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink to="/">Home</MobileNavLink>
            <MobileNavLink to="/collection">Collection</MobileNavLink>
            <MobileNavLink to="/about">About</MobileNavLink>
            <MobileNavLink to="/contact">Contact</MobileNavLink>
            <li className="border-t border-gray-200 my-2"></li>
            <MobileNavLink to="/wish">
              <span className="flex items-center gap-2">
                <Heart size={20} /> Wishlist
              </span>
            </MobileNavLink>
            <MobileNavLink to="/cart">
              <span className="flex items-center gap-2">
                <ShoppingCart size={20} /> Cart
              </span>
            </MobileNavLink>
            
            {/* Mobile Profile Section */}
            {isLoggedIn ? (
              <>
                <li className="border-t border-gray-200 my-2"></li>
                <li className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-900">{user.name || 'User'}</div>
                  <div className="text-xs text-gray-500">{user.email || ''}</div>
                </li>
                <MobileNavLink to="/profile">
                  <span className="flex items-center gap-2">
                    <UserCircle size={20} /> Profile
                  </span>
                </MobileNavLink>
                <MobileNavLink to="/order">
                  <span className="flex items-center gap-2">
                    <Package size={20} /> Orders
                  </span>
                </MobileNavLink>
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="border-t border-gray-200 my-2"></li>
                <MobileNavLink to="/login">
                  <span className="flex items-center gap-2">
                    <User size={20} /> Login
                  </span>
                </MobileNavLink>
                <MobileNavLink to="/signup">
                  <span className="flex items-center gap-2">
                    <UserCircle size={20} /> Sign Up
                  </span>
                </MobileNavLink>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
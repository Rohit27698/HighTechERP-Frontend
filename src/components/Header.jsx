import React, {useEffect, useState, useRef} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { applyTheme } from '../services/api';

export default function Header(){
  const [settings, setSettings] = useState({});
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const d = await api.auth.user(token);
      const userData = d.data || d;
      if (userData && !d.error) {
        setUser(userData);
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        return;
      }
      const items = await api.cart.show('', token);
      setCartCount(Array.isArray(items) ? items.length : 0);
    } catch (err) {
      console.error('Cart fetch error:', err);
    }
  };

  useEffect(()=>{
    const loadSettings = async () => {
      try {
        const data = await api.settings.get();
        const settingsData = data.data || data || {};
        setSettings(settingsData);
        
        // Apply theme colors if available
        if (settingsData.css_variables) {
          applyTheme(settingsData.css_variables);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
    // try fetch user if token present
    loadUser();
    updateCartCount();
  },[]);

  useEffect(() => {
    function onCartUpdated() {
      updateCartCount();
    }

    window.addEventListener('cart_updated', onCartUpdated);
    return () => window.removeEventListener('cart_updated', onCartUpdated);
  }, []);

  useEffect(() => {
    function onAuthUpdated() {
      loadUser();
      updateCartCount();
    }

    window.addEventListener('auth_updated', onAuthUpdated);
    return () => window.removeEventListener('auth_updated', onAuthUpdated);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.auth.logout(token);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
    setDropdownOpen(false);
    navigate('/');
  }

  const initials = user && user.name ? user.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : '';

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand">
          <Link to="/">
            {settings.ecom_logo ? (
              <img src={api.toFullUrl(settings.ecom_logo)} alt={settings.ecom_title || 'Shop'} className="logo"/>
            ) : (
              <h1 className="site-title">{settings.ecom_title || 'Shop'}</h1>
            )}
          </Link>
        </div>

        <nav className="nav">
          <Link to="/products" className="nav-link">Shop</Link>
          {user && (
            <Link to="/cart" className="nav-link" aria-label="Cart">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 3h2l1 4h13l-1.5 8h-12z"></path>
                  <circle cx="9" cy="20" r="1"></circle>
                  <circle cx="18" cy="20" r="1"></circle>
                </svg>
                {cartCount > 0 && <span>({cartCount})</span>}
              </span>
            </Link>
          )}
        </nav>

        <div className="profile">
          {user ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <button 
                className="profile-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Profile menu"
              >
                <div className="avatar" title={user.name || user.email}>
                  {user.profile_picture ? (
                    <img src={api.toFullUrl(user.profile_picture)} alt={user.name || 'User'}/>
                  ) : (
                    initials || 'U'
                  )}
                </div>
              </button>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="avatar-lg">
                      {user.profile_picture ? (
                        <img src={api.toFullUrl(user.profile_picture)} alt={user.name || 'User'}/>
                      ) : (
                        initials || 'U'
                      )}
                    </div>
                    <div className="user-info">
                      <p className="user-name">{user.name || 'User'}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    My Profile
                  </Link>
                  
                  <Link 
                    to="/my-orders" 
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"></path>
                    </svg>
                    My Orders
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 12H5M12 19l-7-7 7-7"></path>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

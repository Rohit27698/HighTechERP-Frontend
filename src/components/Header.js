import React, {useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Header(){
  const [settings, setSettings] = useState({});
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(()=>{
    api.settings.get().then(data => setSettings(data.data || data || {}));
    // try fetch user if token present
    const token = localStorage.getItem('token');
    if (token) {
      api.auth.user(token).then(d => {
        const userData = d.data || d;
        if (userData && !d.error) setUser(userData);
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
    // fetch cart count
    updateCartCount();
  },[]);

  const updateCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const guest = localStorage.getItem('guest_id') || Date.now().toString();
      localStorage.setItem('guest_id', guest);
      const items = await api.cart.show(guest, token);
      setCartCount(Array.isArray(items) ? items.length : 0);
    } catch (err) {
      console.error('Cart fetch error:', err);
    }
  };

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
    navigate('/');
    window.location.reload();
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
          <Link to="/cart" className="nav-link">
            Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Link>
        </nav>

        <div className="profile">
          {user ? (
            <>
              <div className="avatar" title={user.name || user.email}>
                {user.avatar ? (
                  <img src={api.toFullUrl(user.avatar)} alt={user.name || 'User'}/>
                ) : (
                  initials || 'U'
                )}
              </div>
              <button className="btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}

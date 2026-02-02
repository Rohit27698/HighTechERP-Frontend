import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await api.cart.show('', token);
      if (data.error) {
        console.error('Cart fetch error:', data.message);
        setItems([]);
      } else {
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, []);

  const handleRemove = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (window.confirm('Please login to manage your cart. Would you like to login now?')) {
        navigate('/login');
      }
      return;
    }
    
    try {
      const result = await api.cart.remove({ product_id: productId }, token);
      if (result.error) {
        if (result.status === 401) {
          localStorage.removeItem('token');
          if (window.confirm('Your session has expired. Please login again.')) {
            navigate('/login');
          }
        } else {
          alert(result.message || 'Failed to remove item. Please try again.');
        }
      } else {
        await fetchCart();
        window.dispatchEvent(new Event('cart_updated'));
      }
    } catch (err) {
      alert('Failed to remove item. Please try again.');
      console.error('Remove error:', err);
    }
  };

  const handleUpdateQty = async (productId, newQty) => {
    if (newQty < 1) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      if (window.confirm('Please login to manage your cart. Would you like to login now?')) {
        navigate('/login');
      }
      return;
    }
    
    try {
      const result = await api.cart.update({ product_id: productId, quantity: newQty }, token);
      if (result.error) {
        if (result.status === 401) {
          localStorage.removeItem('token');
          if (window.confirm('Your session has expired. Please login again.')) {
            navigate('/login');
          }
        } else {
          alert(result.message || 'Failed to update quantity. Please try again.');
        }
      } else {
        await fetchCart();
        window.dispatchEvent(new Event('cart_updated'));
      }
    } catch (err) {
      alert('Failed to update quantity. Please try again.');
      console.error('Update error:', err);
    }
  };

  const total = items.reduce((sum, it) => {
    const price = parseFloat(it.product?.price || 0);
    const qty = it.quantity || 1;
    return sum + (price * qty);
  }, 0);

  if (loading) {
    return (
      <main className="page">
        <div className="container">
          <div className="loading">Loading cart...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">Your Cart</h1>

        {items.length === 0 ? (
          <div className="card card-pad empty">
            <p className="muted" style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Your cart is empty</p>
            <Link
              to="/products"
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(it => {
                const product = it.product || {};
                const img = api.toFullUrl(product.image || (product.images && product.images[0]));
                const price = parseFloat(product.price || 0);
                const itemTotal = price * (it.quantity || 1);

                return (
                  <div key={product.id} className="cart-item">
                    <Link to={`/products/${product.id}`} className="cart-item-img-link">
                      <img
                        src={img || 'https://via.placeholder.com/150?text=No+Image'}
                        alt={product.title || product.name || 'Product'}
                        className="cart-item-img"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </Link>
                    <div className="cart-item-details">
                      <Link to={`/products/${product.id}`} className="cart-item-name-link">
                        <h3 className="cart-item-name">{product.title || product.name || 'Untitled Product'}</h3>
                      </Link>
                      <div className="cart-item-price">₹{price.toLocaleString('en-IN')}</div>
                      <div className="cart-item-qty">
                        <label className="qty-label">Quantity:</label>
                        <div className="qty-controls">
                          <button
                            onClick={() => handleUpdateQty(product.id, (it.quantity || 1) - 1)}
                            className="qty-btn"
                          >
                            −
                          </button>
                          <span className="qty-value">{it.quantity || 1}</span>
                          <button
                            onClick={() => handleUpdateQty(product.id, (it.quantity || 1) + 1)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-item-total">Total: ₹{itemTotal.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-info">
                <div className="cart-summary-total">Total: ₹{total.toLocaleString('en-IN')}</div>
                <div className="muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{items.length} {items.length === 1 ? 'item' : 'items'}</div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}

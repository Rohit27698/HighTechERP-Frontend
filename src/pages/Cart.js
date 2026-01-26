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
      const guest = localStorage.getItem('guest_id') || Date.now().toString();
      localStorage.setItem('guest_id', guest);
      const data = await api.cart.show(guest, token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          alert(result.data?.message || 'Failed to remove item. Please try again.');
        }
      } else {
        await fetchCart();
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
      const result = await api.cart.add({ product_id: productId, quantity: newQty }, token);
      if (result.error) {
        if (result.status === 401) {
          localStorage.removeItem('token');
          if (window.confirm('Your session has expired. Please login again.')) {
            navigate('/login');
          }
        } else {
          alert(result.data?.message || 'Failed to update quantity. Please try again.');
        }
      } else {
        await fetchCart();
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
      <main style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="loading">Loading cart...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#2d3748',
          marginBottom: '2rem',
        }}>
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          }}>
            <p style={{ fontSize: '1.2rem', color: '#718096', marginBottom: '1.5rem' }}>
              Your cart is empty
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {items.map(it => {
                const product = it.product || {};
                const img = api.toFullUrl(product.image || (product.images && product.images[0]));
                const price = parseFloat(product.price || 0);
                const itemTotal = price * (it.quantity || 1);

                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      padding: '1.5rem',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
                    }}
                  >
                    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                      <img
                        src={img || 'https://via.placeholder.com/150?text=No+Image'}
                        alt={product.title || product.name || 'Product'}
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </Link>
                    <div style={{ flex: 1 }}>
                      <Link
                        to={`/products/${product.id}`}
                        style={{
                          textDecoration: 'none',
                          color: '#2d3748',
                        }}
                      >
                        <h3 style={{
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                          color: '#2d3748',
                        }}>
                          {product.title || product.name || 'Untitled Product'}
                        </h3>
                      </Link>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#667eea',
                        marginBottom: '1rem',
                      }}>
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.9rem', color: '#718096' }}>Quantity:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleUpdateQty(product.id, (it.quantity || 1) - 1)}
                            style={{
                              width: '32px',
                              height: '32px',
                              border: '1px solid #e2e8f0',
                              background: '#fff',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            minWidth: '40px',
                            textAlign: 'center',
                            fontWeight: '600',
                          }}>
                            {it.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(product.id, (it.quantity || 1) + 1)}
                            style={{
                              width: '32px',
                              height: '32px',
                              border: '1px solid #e2e8f0',
                              background: '#fff',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            +
                          </button>
                        </div>
                        <div style={{
                          marginLeft: 'auto',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2d3748',
                        }}>
                          Total: ₹{itemTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(product.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        color: '#c33',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#fcc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fee';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}>
              <div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#2d3748',
                }}>
                  Total: ₹{total.toLocaleString('en-IN')}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  marginTop: '0.25rem',
                }}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
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

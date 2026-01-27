import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import Footer from '../components/Footer';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await api.products.get(id);
        setProduct(data.data || data);
        const prod = data.data || data;
        setStock(typeof prod?.stock === 'number' ? prod.stock : null);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAdd = async () => {
    const token = localStorage.getItem('token');
    
    // Check if user is logged in
    if (!token) {
      if (window.confirm('Please login to add items to cart. Would you like to login now?')) {
        navigate('/login');
      }
      return;
    }
    if (stock !== null && stock <= 0) {
      alert('This product is out of stock.');
      return;
    }
    if (stock !== null && qty > stock) {
      alert(`Only ${stock} left in stock.`);
      return;
    }

    setAdding(true);
    try {
      const result = await api.cart.add({ product_id: id, quantity: qty }, token);
      
      if (result.error) {
        if (result.status === 401) {
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          if (window.confirm('Your session has expired. Please login again.')) {
            navigate('/login');
          }
        } else {
          alert(result.data?.message || 'Failed to add to cart. Please try again.');
        }
      } else {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.textContent = '✓ Added to cart!';
        successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:1rem 1.5rem;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          document.body.removeChild(successMsg);
        }, 3000);
      }
    } catch (err) {
      alert('Failed to add to cart. Please try again.');
      console.error('Cart error:', err);
    }
    setAdding(false);
  }

  if (loading) {
    return (
      <main>
        <div className="container" style={{ padding: '4rem 0' }}>
          <div className="loading">Loading product...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h2 style={{ color: '#718096', marginBottom: '1rem' }}>Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Back to Products
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const images = [product.image].concat(product.images || []).filter(Boolean).map(i => api.toFullUrl(i));
  const price = product.price ? parseFloat(product.price).toLocaleString('en-IN') : '0';

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container">
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '2rem',
            padding: '0.5rem 1rem',
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#4a5568',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ← Back
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          background: '#fff',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          marginBottom: '2rem',
        }}
        className="product-detail"
        >
          <div className="media">
            {images.length > 0 ? (
              <Carousel images={images} />
            ) : (
              <div style={{
                width: '100%',
                height: '400px',
                background: '#f7fafc',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a0aec0',
              }}>
                No image available
              </div>
            )}
          </div>

          <div className="info">
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#2d3748',
              marginBottom: '1rem',
            }}>
              {product.title || product.name || 'Untitled Product'}
            </h1>

            {product.vendor && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                background: '#edf2f7',
                borderRadius: '8px',
                display: 'inline-block',
              }}>
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>Vendor: </span>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>
                  {product.vendor.name || 'Unknown'}
                </span>
              </div>
            )}

            <div className="price" style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#667eea',
              marginBottom: '1.5rem',
            }}>
              ₹{price}
            </div>
            {stock !== null && (
              <div style={{ marginBottom: '1rem', fontWeight: '600', color: stock > 0 ? '#10b981' : '#e53e3e' }}>
                {stock > 0 ? `In stock: ${stock}` : 'Out of stock'}
              </div>
            )}

            {product.description && (
              <div style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: '#f7fafc',
                borderRadius: '12px',
                lineHeight: '1.8',
                color: '#4a5568',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#2d3748' }}>
                  Description
                </h3>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{product.description}</p>
              </div>
            )}

            <div className="purchase" style={{
              padding: '1.5rem',
              background: '#f7fafc',
              borderRadius: '12px',
            }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: '#2d3748',
              }}>
                Quantity
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <input
                  type="number"
                  min="1"
                  max={stock || undefined}
                  value={qty}
                  onChange={e => setQty(Math.max(1, Math.min(stock || Infinity, parseInt(e.target.value || 1))))}
                  style={{
                    width: '100px',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    textAlign: 'center',
                  }}
                />
                <button
                  onClick={handleAdd}
                  disabled={adding || (stock !== null && stock <= 0)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    background: adding 
                      ? '#a0aec0' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: adding ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: adding ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    if (!adding) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!adding) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
              <button
                onClick={() => navigate('/cart')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#fff',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  color: '#667eea',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#667eea';
                }}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    async function load() {
      try {
        const res = await api.orders.list(1, token);
        if (res.error) {
          setError(res.message || 'Failed to fetch orders');
        } else {
          setOrders(res.data || res);
        }
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  if (loading) {
    return (
      <main style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="loading">Loading your orders...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '1.5rem' }}>
          My Orders
        </h1>
        {error && (
          <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        {orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <p style={{ color: '#718096', marginBottom: '1rem' }}>No orders yet.</p>
            <button
              onClick={() => navigate('/products')}
              style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              Shop Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontWeight: '700', color: '#2d3748' }}>Order #{order.order_number || order.id}</div>
                  <div style={{ fontWeight: '600', color: '#667eea' }}>₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#718096', fontSize: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>Status: {order.status}</span>
                  <span>Placed: {order.created_at ? new Date(order.created_at).toLocaleString() : ''}</span>
                </div>
                <div style={{ marginTop: '0.75rem', color: '#4a5568', fontSize: '0.95rem' }}>
                  {order.items?.slice(0,3).map(it => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 0' }}>
                      <span>{it.product?.title || 'Product'}</span>
                      <span>Qty {it.quantity} × ₹{parseFloat(it.unit_price || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div style={{ marginTop: '0.25rem', color: '#718096' }}>+{order.items.length - 3} more items</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

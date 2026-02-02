import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

export default function MyOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
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
        const res = await api.orders.get(id, token);
        if (res.error) setError(res.message || 'Failed to load order');
        else setOrder(res);
      } catch (e) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <main style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="loading">Loading order...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main style={{ padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error || 'Order not found'}</p>
          <button onClick={() => navigate('/my-orders')} style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
            Back to My Orders
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const billing = order.billing_address || {};
  const shipping = order.shipping_address || {};

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/my-orders" style={{ color: '#667eea', fontWeight: '600' }}>← Back to My Orders</Link>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.5rem' }}>
          Order #{order.order_number || order.id}
        </h1>
        <div style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Placed: {order.created_at ? new Date(order.created_at).toLocaleString() : ''} — Status: {order.status}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Items</h3>
            {order.items?.map(it => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{it.product?.title || 'Product'}</div>
                  <div style={{ color: '#718096', fontSize: '0.9rem' }}>Qty {it.quantity}</div>
                </div>
                <div style={{ textAlign: 'right', color: '#2d3748', fontWeight: '600' }}>
                  ₹{parseFloat(it.unit_price || 0).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: '700', color: '#2d3748' }}>
              <span>Total</span>
              <span>₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#2d3748' }}>Billing Address</h3>
              <AddressBlock data={billing} />
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#2d3748' }}>Shipping Address</h3>
              <AddressBlock data={shipping} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function AddressBlock({ data }) {
  if (!data || Object.keys(data).length === 0) return <div style={{ color: '#a0aec0' }}>Not provided</div>;
  return (
    <div style={{ color: '#4a5568', fontSize: '0.95rem', lineHeight: '1.5' }}>
      {data.name && <div>{data.name}</div>}
      {data.line1 && <div>{data.line1}</div>}
      {data.line2 && <div>{data.line2}</div>}
      {(data.city || data.state || data.postal_code) && (
        <div>{data.city} {data.state} {data.postal_code}</div>
      )}
      {data.country && <div>{data.country}</div>}
      {data.phone && <div>Phone: {data.phone}</div>}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const statuses = ['all', ...new Set(orders.map(o => o.status))];

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
    <main style={{ padding: '2rem 0', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '1.5rem' }}>
          My Orders
        </h1>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        {orders.length > 0 && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.5rem 1rem',
                  background: filterStatus === status ? '#667eea' : '#f3f4f6',
                  color: filterStatus === status ? '#fff' : '#4b5563',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {status === 'all' ? 'All Orders' : status}
              </button>
            ))}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '1rem' }}>
              {orders.length === 0 ? 'No orders yet.' : `No ${filterStatus} orders.`}
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              Shop Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredOrders.map((order) => (
              <div key={order.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', marginBottom: '1rem', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#2d3748', fontSize: '1rem' }}>
                      Order #{order.order_number || order.id}
                    </div>
                    <div style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>Order Status</div>
                      <StatusBadge status={order.status} type="order" />
                    </div>
                    {order.payment_status && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>Payment</div>
                        <StatusBadge status={order.payment_status} type="payment" />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Items</div>
                    <div style={{ color: '#2d3748', fontWeight: '600' }}>
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total Amount</div>
                    <div style={{ color: '#667eea', fontWeight: '700', fontSize: '1.1rem' }}>
                      ₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <Link
                    to={`/my-orders/${order.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#667eea',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#5a67d8'}
                    onMouseLeave={(e) => e.target.style.background = '#667eea'}
                  >
                    View Details
                  </Link>
                </div>

                {order.items && order.items.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: '600' }}>Items Preview</div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {order.items.slice(0, 3).map(it => (
                        <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#4a5568', fontSize: '0.9rem', paddingBottom: '0.5rem' }}>
                          <span>{it.product?.title || 'Product'}</span>
                          <span style={{ fontWeight: '600' }}>Qty {it.quantity} × ₹{parseFloat(it.unit_price || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div style={{ marginTop: '0.25rem', color: '#718096', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

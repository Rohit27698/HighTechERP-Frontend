import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import razorpay from '../services/razorpay';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const PAYMENT_PROVIDER = process.env.REACT_APP_PAYMENT_PROVIDER || 'stripe';
const stripePromise = PAYMENT_PROVIDER === 'stripe' ? loadStripe(process.env.REACT_APP_STRIPE_KEY || '') : null;

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function init() {
      try {
        const token = localStorage.getItem('token');
        const guest = localStorage.getItem('guest_id');
        const cart = await api.cart.show(guest, token);
        const items = Array.isArray(cart) ? cart : [];
        if (items.length === 0) {
          navigate('/cart');
          return;
        }
        setCartItems(items);
        const cartTotal = items.reduce((sum, it) => {
          const price = parseFloat(it.product?.price || 0);
          const qty = it.quantity || 1;
          return sum + (price * qty);
        }, 0);
        setTotal(cartTotal);
        const checkoutItems = items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity || 1,
        }));
        // Use env or backend to select provider
        const provider = PAYMENT_PROVIDER.toLowerCase();
        const res = await api.checkout.create(
          { items: checkoutItems, payment_provider: provider },
          token
        );
        if (res.error) {
          setError(res.message || 'Failed to initialize checkout');
        } else if (provider === 'stripe') {
          setClientSecret(res.payment_intent?.client_secret || res.client_secret || null);
        } else if (provider === 'razorpay') {
          setRazorpayOrder(res.razorpay_order || null);
        }
      } catch (err) {
        console.error('Checkout init error:', err);
        setError('Failed to initialize checkout. Please try again.');
      } finally {
        setInitLoading(false);
      }
    }
    init();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (PAYMENT_PROVIDER === 'stripe') {
      if (!stripe || !elements || !clientSecret) return;
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        const successMsg = document.createElement('div');
        successMsg.textContent = '✓ Payment successful! Redirecting...';
        successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:1rem 1.5rem;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          document.body.removeChild(successMsg);
          navigate('/');
        }, 2000);
      }
    } else if (PAYMENT_PROVIDER === 'razorpay' && razorpayOrder) {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: 'Checkout',
        description: 'Order Payment',
        handler: function (response) {
          // You can verify payment on backend here
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          navigate('/');
        },
        prefill: {},
        theme: { color: '#667eea' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
    setLoading(false);
  };

  if (initLoading) {
    return (
      <main style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="loading">Initializing checkout...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error && !clientSecret) {
    return (
      <main style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          }}>
            <p style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</p>
            <button
              onClick={() => navigate('/cart')}
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
              Back to Cart
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#2d3748',
          marginBottom: '2rem',
        }}>
          Checkout
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
        }}
        className="checkout-grid"
        >
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#2d3748',
            }}>
              Payment Information
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{
                padding: '1.5rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                background: '#f7fafc',
              }}>
                <CardElement options={cardElementOptions} />
              </div>
              
              {error && (
                <div style={{
                  padding: '1rem',
                  background: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  color: '#c33',
                  marginBottom: '1.5rem',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!stripe || !clientSecret || loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: loading || !stripe || !clientSecret
                    ? '#a0aec0'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: loading || !stripe || !clientSecret ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: loading || !stripe || !clientSecret
                    ? 'none'
                    : '0 4px 12px rgba(102, 126, 234, 0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!loading && stripe && clientSecret) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && stripe && clientSecret) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {loading ? 'Processing Payment...' : `Pay ₹${total.toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>

          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
            height: 'fit-content',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#2d3748',
            }}>
              Order Summary
            </h2>
            <div style={{ marginBottom: '1.5rem' }}>
              {cartItems.map((it, idx) => {
                const product = it.product || {};
                const price = parseFloat(product.price || 0);
                const qty = it.quantity || 1;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: idx < cartItems.length - 1 ? '1px solid #e2e8f0' : 'none',
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {product.title || product.name || 'Product'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                        Qty: {qty} × ₹{price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#2d3748' }}>
                      ₹{(price * qty).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              paddingTop: '1rem',
              borderTop: '2px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748' }}>
                Total:
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                ₹{total.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function Checkout() {
  if (PAYMENT_PROVIDER === 'stripe') {
    return (
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    );
  }
  return <CheckoutForm />;
}

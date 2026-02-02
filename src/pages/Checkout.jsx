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
    const SKIP_PAYMENT_CHECKOUT = process.env.REACT_APP_SKIP_PAYMENT_CHECKOUT === 'true';
    // Test order creation without payment
    const handleTestOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const checkoutItems = cartItems.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity || 1,
        }));
        const provider = PAYMENT_PROVIDER.toLowerCase();
        const res = await api.checkout.create(
          {
            items: checkoutItems,
            payment_provider: provider,
            billing_address: billing,
            shipping_address: sameAsBilling ? billing : shipping,
          },
          token
        );
        if (res.error) {
          setError(res.message || 'Failed to create test order');
        } else {
          alert('Test order created!');
          window.dispatchEvent(new Event('cart_updated'));
          navigate('/');
        }
      } catch (err) {
        setError('Failed to create test order.');
      } finally {
        setLoading(false);
      }
    };
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [billing, setBilling] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' });
  const [shipping, setShipping] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const updateBilling = (field, value) => setBilling(prev => ({ ...prev, [field]: value }));
  const updateShipping = (field, value) => setShipping(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    async function init() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        // preload addresses
        const addrRes = await api.addresses.list(token);
        const savedAddr = addrRes.data || addrRes;
        let billingAddr = null;
        let shippingAddr = null;
        if (Array.isArray(savedAddr) && savedAddr.length) {
          billingAddr = savedAddr.find(a => a.is_default_billing) || savedAddr[0];
          shippingAddr = savedAddr.find(a => a.is_default_shipping) || billingAddr;
          setBilling({
            name: billingAddr.name || '',
            phone: billingAddr.phone || '',
            line1: billingAddr.line1 || '',
            line2: billingAddr.line2 || '',
            city: billingAddr.city || '',
            state: billingAddr.state || '',
            postal_code: billingAddr.postal_code || '',
            country: billingAddr.country || 'India',
          });
          setShipping({
            name: shippingAddr.name || '',
            phone: shippingAddr.phone || '',
            line1: shippingAddr.line1 || '',
            line2: shippingAddr.line2 || '',
            city: shippingAddr.city || '',
            state: shippingAddr.state || '',
            postal_code: shippingAddr.postal_code || '',
            country: shippingAddr.country || 'India',
          });
        }

        const cart = await api.cart.show('', token);
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
        // Important: do NOT create an order here.
        // Creating the order on page-load causes duplicates on refresh/retry.
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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!cartItems.length) {
      setError('Your cart is empty.');
      navigate('/cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkoutItems = cartItems.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity || 1,
      }));
      const provider = PAYMENT_PROVIDER.toLowerCase();

      const initRes = await api.checkout.create(
        {
          items: checkoutItems,
          payment_provider: provider,
          billing_address: billing,
          shipping_address: sameAsBilling ? billing : shipping,
        },
        token
      );

      if (initRes.error) {
        setError(initRes.message || 'Failed to initialize payment');
        return;
      }

      if (provider === 'stripe') {
        const clientSecret = initRes.payment_intent?.client_secret || initRes.client_secret || null;
        if (!stripe || !elements || !clientSecret) {
          setError('Payment cannot be started. Please refresh and try again.');
          return;
        }
        const card = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card },
        });
        if (result.error) {
          setError(result.error.message);
          return;
        }
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          window.dispatchEvent(new Event('cart_updated'));
          const successMsg = document.createElement('div');
          successMsg.textContent = '✓ Payment successful! Redirecting...';
          successMsg.className = 'alert-success';
          document.body.appendChild(successMsg);
          setTimeout(() => {
            document.body.removeChild(successMsg);
            navigate('/');
          }, 2000);
        }
      } else if (provider === 'razorpay') {
        const razorpayOrder = initRes.razorpay_order || null;
        if (!razorpayOrder) {
          setError('Failed to initialize Razorpay.');
          return;
        }

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          order_id: razorpayOrder.id,
          name: 'Checkout',
          description: 'Order Payment',
          handler: function (response) {
            alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
            window.dispatchEvent(new Event('cart_updated'));
            navigate('/');
          },
          prefill: {},
          theme: { color: '#667eea' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <main className="page">
        <div className="container">
          <div className="loading">Initializing checkout...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="container">
          <div className="card card-pad empty">
            <p className="muted" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</p>
            <button
              onClick={() => navigate('/cart')}
              className="btn btn-primary"
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
    <main className="page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-grid">
          <div className="checkout-left">
            {/* Addresses */}
            <div className="card card-pad">
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#2d3748' }}>Billing Address</h2>
              <div className="address-grid">
                <input className="field" placeholder="Full name" value={billing.name} onChange={e => updateBilling('name', e.target.value)} required />
                <input className="field" placeholder="Phone" value={billing.phone} onChange={e => updateBilling('phone', e.target.value)} />
                <input className="field" placeholder="Address line 1" value={billing.line1} onChange={e => updateBilling('line1', e.target.value)} required />
                <input className="field" placeholder="Address line 2" value={billing.line2} onChange={e => updateBilling('line2', e.target.value)} />
                <div className="address-grid-2">
                  <input className="field" placeholder="City" value={billing.city} onChange={e => updateBilling('city', e.target.value)} required />
                  <input className="field" placeholder="State" value={billing.state} onChange={e => updateBilling('state', e.target.value)} />
                </div>
                <div className="address-grid-2">
                  <input className="field" placeholder="Postal code" value={billing.postal_code} onChange={e => updateBilling('postal_code', e.target.value)} />
                  <input className="field" placeholder="Country" value={billing.country} onChange={e => updateBilling('country', e.target.value)} />
                </div>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} />
                Shipping same as billing
              </label>
            </div>

            {!sameAsBilling && (
              <div className="card card-pad">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#2d3748' }}>Shipping Address</h2>
                <div className="address-grid">
                  <input className="field" placeholder="Full name" value={shipping.name} onChange={e => updateShipping('name', e.target.value)} required />
                  <input className="field" placeholder="Phone" value={shipping.phone} onChange={e => updateShipping('phone', e.target.value)} />
                  <input className="field" placeholder="Address line 1" value={shipping.line1} onChange={e => updateShipping('line1', e.target.value)} required />
                  <input className="field" placeholder="Address line 2" value={shipping.line2} onChange={e => updateShipping('line2', e.target.value)} />
                  <div className="address-grid-2">
                    <input className="field" placeholder="City" value={shipping.city} onChange={e => updateShipping('city', e.target.value)} required />
                    <input className="field" placeholder="State" value={shipping.state} onChange={e => updateShipping('state', e.target.value)} />
                  </div>
                  <div className="address-grid-2">
                    <input className="field" placeholder="Postal code" value={shipping.postal_code} onChange={e => updateShipping('postal_code', e.target.value)} />
                    <input className="field" placeholder="Country" value={shipping.country} onChange={e => updateShipping('country', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <div className="card card-pad">
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#2d3748' }}>Payment Information</h2>
            {SKIP_PAYMENT_CHECKOUT && (
              <button
                type="button"
                onClick={handleTestOrder}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '1.5rem', background: '#10b981' }}
                disabled={loading}
              >
                {loading ? 'Creating Test Order...' : 'Create Test Order (No Payment)'}
              </button>
            )}
            <form onSubmit={handleSubmit}>
              <div className="card-element-wrapper">
                <CardElement options={cardElementOptions} />
              </div>
              
              {error && (
                <div className="card card-pad" style={{ background: '#fee', borderColor: '#fcc', color: '#c33', marginBottom: '1.5rem' }}>
                  <p className="muted" style={{ color: '#c33', margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (PAYMENT_PROVIDER === 'stripe' && !stripe)}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
              >
                {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>
            </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card card-pad" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#2d3748' }}>Order Summary</h2>
            <div className="order-summary-items">
              {cartItems.map((it, idx) => {
                const product = it.product || {};
                const price = parseFloat(product.price || 0);
                const qty = it.quantity || 1;
                return (
                  <div key={idx} className="order-summary-item">
                    <div>
                      <div className="order-item-name">{product.title || product.name || 'Product'}</div>
                      <div className="muted" style={{ fontSize: '0.9rem' }}>Qty: {qty} × ₹{price.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="order-item-price">₹{(price * qty).toLocaleString('en-IN')}</div>
                  </div>
                );
              })}
            </div>
            <div className="order-summary-total">
              <div className="order-total-label">Total:</div>
              <div className="order-total-amount">₹{total.toLocaleString('en-IN')}</div>
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

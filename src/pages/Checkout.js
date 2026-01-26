import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY || '');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create order & payment intent
    async function init() {
      const guest = localStorage.getItem('guest_id');
      // For simplicity, rebuild items from cart API
      const cart = await api.cart.show(guest);
      const items = (cart || []).map(i => ({ product_id: i.product.id, quantity: i.quantity }));
      const res = await api.checkout.create({ items, payment_provider: 'stripe' });
      setClientSecret(res.payment_intent?.client_secret || null);
    }
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    const card = elements.getElement(CardElement);
    const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
    if (result.error) {
      alert(result.error.message);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      alert('Payment successful');
      // redirect to orders or thank you
      window.location.href = '/';
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Payment</h2>
      <CardElement />
      <button type="submit" disabled={!stripe || !clientSecret || loading}>{loading ? 'Processing...' : 'Pay'}</button>
    </form>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

// Razorpay integration service for frontend
// Usage: import and use api.razorpay.createOrder etc.

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export const razorpay = {
  createOrder: (payload, token) =>
    fetch(`${API_BASE}/razorpay/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }).then(res => res.json()),
};

export default razorpay;

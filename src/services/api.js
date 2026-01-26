const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

async function request(path, { method = 'GET', body = null, token = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      return { error: true, status: res.status, data };
    }

    return data;
  } catch (err) {
    return { error: true, message: err.message };
  }
}

function toFullUrl(path){
  if (!path) return path;
  if (path.startsWith('http')) return path;
  const apiRoot = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/,'');
  if (path.startsWith('/')) path = path.replace(/^\//,'');
  return `${apiRoot}/storage/${path}`;
}

export const products = {
  list: (page = 1) => request(`products?page=${page}`),
  get: (id) => request(`products/${id}`),
};

export const auth = {
  register: (payload) => request('auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('auth/login', { method: 'POST', body: payload }),
  logout: (token) => request('auth/logout', { method: 'POST', token }),
  user: (token) => request('auth/user', { token }),
};

export const cart = {
  show: (guest_id, token) => request(`cart?guest_id=${guest_id}`, { token }),
  add: (payload, token) => request('cart/add', { method: 'POST', body: payload, token }),
  remove: (payload, token) => request('cart/remove', { method: 'POST', body: payload, token }),
};

export const checkout = {
  create: (payload, token) => request('checkout', { method: 'POST', body: payload, token }),
};

export const settings = {
  get: () => request('business-settings'),
};

export const newsletter = {
  subscribe: (payload) => request('newsletter/subscribe', { method: 'POST', body: payload }),
};

export default { products, auth, cart, checkout, settings, newsletter, toFullUrl };

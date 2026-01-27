const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Extract error message from Laravel validation response
 */
function extractErrorMessage(data, status) {
  if (!data) return 'An error occurred';
  
  // Laravel validation errors (422)
  if (status === 422 && data.errors) {
    const firstError = Object.values(data.errors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError;
  }
  
  // Laravel error message
  if (data.message) {
    return data.message;
  }
  
  // Direct error string
  if (typeof data === 'string') {
    return data;
  }
  
  // Error object with message
  if (data.error && typeof data.error === 'string') {
    return data.error;
  }
  
  return 'An error occurred';
}

async function request(path, { method = 'GET', body = null, token = null } = {}) {
  const headers = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
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
      const text = await res.text();
      // If we get HTML or non-JSON, it's an error
      return { 
        error: true, 
        status: res.status, 
        message: 'Invalid response format from server',
        data: text.substring(0, 200) // First 200 chars for debugging
      };
    }

    // Handle error responses
    if (!res.ok) {
      return { 
        error: true, 
        status: res.status, 
        message: extractErrorMessage(data, res.status),
        errors: data.errors || null,
        data 
      };
    }

    // Success response - return data directly
    return data;
  } catch (err) {
    return { 
      error: true, 
      message: err.message || 'Network error. Please check your connection.',
      status: 0
    };
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

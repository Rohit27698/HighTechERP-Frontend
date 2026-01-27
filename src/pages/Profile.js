import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: '', password: '', password_confirmation: '' });
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India', is_default_billing: true, is_default_shipping: true, label: 'Home' });
  const [saving, setSaving] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    async function load() {
      try {
        const u = await api.auth.user(token);
        if (u.error) {
          setError(u.message || 'Failed to load profile');
        } else {
          setUser(u);
          setForm(f => ({ ...f, name: u.name || '' }));
        }
        const res = await api.addresses.list(token);
        if (!res.error) setAddresses(res.data || res);
      } catch (e) {
        setError('Failed to load profile');
      }
    }
    load();
  }, [token, navigate]);

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await api.profile.update(form, token);
      if (res.error) setError(res.message || 'Update failed');
      else setUser(res.user || res);
    } catch {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setAddrSaving(true);
    setError(null);
    try {
      const res = await api.addresses.create(addrForm, token);
      if (res.error) setError(res.message || 'Address save failed');
      else {
        const list = await api.addresses.list(token);
        setAddresses(list.data || list);
        setAddrForm({ name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India', is_default_billing: false, is_default_shipping: false, label: 'Home' });
      }
    } catch {
      setError('Address save failed');
    } finally {
      setAddrSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    await api.addresses.remove(id, token);
    const list = await api.addresses.list(token);
    setAddresses(list.data || list);
  };

  if (!user) {
    return (
      <main style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="loading">Loading profile...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
          <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>Profile</h2>
          {error && <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={updateProfile}>
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <label className="form-label">New Password (optional)</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })} />
            <button type="submit" disabled={saving} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
          <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>Addresses</h2>
          <form onSubmit={addAddress} style={{ display: 'grid', gap: '0.5rem' }}>
            <input placeholder="Label" className="form-input" value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })} />
            <input placeholder="Full name" className="form-input" value={addrForm.name} onChange={e => setAddrForm({ ...addrForm, name: e.target.value })} required />
            <input placeholder="Phone" className="form-input" value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} />
            <input placeholder="Address line 1" className="form-input" value={addrForm.line1} onChange={e => setAddrForm({ ...addrForm, line1: e.target.value })} required />
            <input placeholder="Address line 2" className="form-input" value={addrForm.line2} onChange={e => setAddrForm({ ...addrForm, line2: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <input placeholder="City" className="form-input" value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} required />
              <input placeholder="State" className="form-input" value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <input placeholder="Postal code" className="form-input" value={addrForm.postal_code} onChange={e => setAddrForm({ ...addrForm, postal_code: e.target.value })} />
              <input placeholder="Country" className="form-input" value={addrForm.country} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label><input type="checkbox" checked={addrForm.is_default_billing} onChange={e => setAddrForm({ ...addrForm, is_default_billing: e.target.checked })} /> Default Billing</label>
              <label><input type="checkbox" checked={addrForm.is_default_shipping} onChange={e => setAddrForm({ ...addrForm, is_default_shipping: e.target.checked })} /> Default Shipping</label>
            </div>
            <button type="submit" disabled={addrSaving} style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
              {addrSaving ? 'Saving...' : 'Add Address'}
            </button>
          </form>

          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <strong>{addr.label || 'Address'}</strong>
                  <button onClick={() => deleteAddress(addr.id)} style={{ background: 'transparent', border: 'none', color: '#c53030', cursor: 'pointer' }}>Delete</button>
                </div>
                <div style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                  <div>{addr.name}</div>
                  <div>{addr.line1}</div>
                  {addr.line2 && <div>{addr.line2}</div>}
                  <div>{addr.city} {addr.state} {addr.postal_code}</div>
                  <div>{addr.country}</div>
                  {addr.phone && <div>Phone: {addr.phone}</div>}
                  <div style={{ color: '#718096', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {addr.is_default_billing && 'Default billing'} {addr.is_default_shipping && '| Default shipping'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India', is_default_billing: true, is_default_shipping: true, label: 'Home' });
  const [saving, setSaving] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profilePictureSaving, setProfilePictureSaving] = useState(false);
  const fileInputRef = useRef(null);

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
          setForm(f => ({ ...f, name: u.name || '', email: u.email || '', phone: u.phone || '' }));
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
    setSuccess(null);
    try {
      const res = await api.profile.update(form, token);
      if (res.error) setError(res.message || 'Update failed');
      else {
        setSuccess('Profile updated successfully!');
        setUser(res.user || res);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePictureSaving(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const res = await fetch('/api/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Profile picture updated successfully!');
        setUser(prev => ({ ...prev, profile_picture: data.profile_picture_url }));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to upload picture');
      }
    } catch (err) {
      setError('Failed to upload picture: ' + err.message);
    } finally {
      setProfilePictureSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) return;

    setProfilePictureSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/profile/picture', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Profile picture deleted successfully!');
        setUser(prev => ({ ...prev, profile_picture: null }));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to delete picture');
      }
    } catch (err) {
      setError('Failed to delete picture: ' + err.message);
    } finally {
      setProfilePictureSaving(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setAddrSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.addresses.create(addrForm, token);
      if (res.error) setError(res.message || 'Address save failed');
      else {
        setSuccess('Address added successfully!');
        const list = await api.addresses.list(token);
        setAddresses(list.data || list);
        setAddrForm({ name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India', is_default_billing: false, is_default_shipping: false, label: 'Home' });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError('Address save failed');
    } finally {
      setAddrSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.addresses.remove(id, token);
      const list = await api.addresses.list(token);
      setAddresses(list.data || list);
      setSuccess('Address deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  const initials = user && user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';

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
    <main style={{ padding: '2rem 0', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: '2rem', color: '#2d3748', fontSize: '2rem' }}>My Account</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Profile Picture Section */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2d3748', fontSize: '1.2rem' }}>Profile Picture</h2>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                color: '#fff',
                fontWeight: '700',
                overflow: 'hidden',
              }}>
                {user.profile_picture ? (
                  <img src={api.toFullUrl(user.profile_picture)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleProfilePictureUpload}
                style={{ display: 'none' }}
                disabled={profilePictureSaving}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={profilePictureSaving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  width: '100%',
                  opacity: profilePictureSaving ? 0.6 : 1,
                }}
              >
                {profilePictureSaving ? 'Uploading...' : 'Upload Picture'}
              </button>

              {user.profile_picture && (
                <button
                  type="button"
                  onClick={deleteProfilePicture}
                  disabled={profilePictureSaving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    opacity: profilePictureSaving ? 0.6 : 1,
                  }}
                >
                  Delete Picture
                </button>
              )}

              <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '1rem' }}>
                Supported: JPEG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>
          </div>

          {/* Profile Information Section */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2d3748', fontSize: '1.2rem' }}>Personal Information</h2>
            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.95rem' }}>
                ⚠ {error}
              </div>
            )}
            {success && (
              <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.95rem' }}>
                ✓ {success}
              </div>
            )}
            <form onSubmit={updateProfile}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Phone</label>
                <input
                  className="form-input"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Optional"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>

              <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>New Password (optional)</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Confirm Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password_confirmation}
                  onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.875rem',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: saving ? 0.6 : 1,
                  fontSize: '1rem',
                }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Addresses Section */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#2d3748', fontSize: '1.2rem' }}>Saved Addresses</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Add Address Form */}
            <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#4a5568', fontSize: '1rem' }}>Add New Address</h3>
              <form onSubmit={addAddress}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    placeholder="Label (e.g., Home, Office)"
                    className="form-input"
                    value={addrForm.label}
                    onChange={e => setAddrForm({ ...addrForm, label: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    placeholder="Full Name"
                    className="form-input"
                    value={addrForm.name}
                    onChange={e => setAddrForm({ ...addrForm, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    placeholder="Phone"
                    className="form-input"
                    value={addrForm.phone}
                    onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    placeholder="Address Line 1"
                    className="form-input"
                    value={addrForm.line1}
                    onChange={e => setAddrForm({ ...addrForm, line1: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    placeholder="Address Line 2"
                    className="form-input"
                    value={addrForm.line2}
                    onChange={e => setAddrForm({ ...addrForm, line2: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    placeholder="City"
                    className="form-input"
                    value={addrForm.city}
                    onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                  <input
                    placeholder="State"
                    className="form-input"
                    value={addrForm.state}
                    onChange={e => setAddrForm({ ...addrForm, state: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    placeholder="Postal Code"
                    className="form-input"
                    value={addrForm.postal_code}
                    onChange={e => setAddrForm({ ...addrForm, postal_code: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                  <input
                    placeholder="Country"
                    className="form-input"
                    value={addrForm.country}
                    onChange={e => setAddrForm({ ...addrForm, country: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={addrForm.is_default_billing}
                      onChange={e => setAddrForm({ ...addrForm, is_default_billing: e.target.checked })}
                    />
                    Default Billing
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={addrForm.is_default_shipping}
                      onChange={e => setAddrForm({ ...addrForm, is_default_shipping: e.target.checked })}
                    />
                    Default Shipping
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={addrSaving}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: addrSaving ? 0.6 : 1,
                  }}
                >
                  {addrSaving ? 'Adding...' : 'Add Address'}
                </button>
              </form>
            </div>

            {/* Addresses List */}
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#4a5568', fontSize: '1rem' }}>My Addresses</h3>
              {addresses.length === 0 ? (
                <p style={{ color: '#718096', fontStyle: 'italic' }}>No addresses saved yet. Add one above!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {addresses.map(addr => (
                    <div key={addr.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f7fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                        <div>
                          <strong style={{ color: '#2d3748' }}>{addr.label || 'Address'}</strong>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#718096' }}>
                            {addr.is_default_billing && '📍 Default Billing'} {addr.is_default_shipping && '🚚 Default Shipping'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <div style={{ color: '#4a5568', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <div>{addr.name}</div>
                        <div>{addr.line1}</div>
                        {addr.line2 && <div>{addr.line2}</div>}
                        <div>{addr.city}{addr.state ? ', ' + addr.state : ''} {addr.postal_code}</div>
                        <div>{addr.country}</div>
                        {addr.phone && <div style={{ marginTop: '0.5rem' }}>📞 {addr.phone}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

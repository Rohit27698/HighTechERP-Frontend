import React, {useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

export default function Register(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    
    try{
      // Get guest_id for cart migration
      const guestId = localStorage.getItem('guest_id');
      const registerData = {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      };
      if (guestId) {
        registerData.guest_id = guestId;
      }
      
      const res = await api.auth.register(registerData);
      
      if (res.error) {
        setError(res.message || 'Registration failed. Please try again.');
      } else if (res.token) {
        localStorage.setItem('token', res.token);
        // Store user data if available
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        // Clear guest_id after successful registration (cart migrated on backend)
        if (guestId) {
          localStorage.removeItem('guest_id');
        }
        navigate('/');
        window.dispatchEvent(new Event('auth_updated'));
      } else {
        setError('Invalid response from server');
      }
    } catch(err){
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="card card-pad" style={{ maxWidth: '450px', margin: '0 auto', borderRadius: '16px' }}>
          <h2 className="page-title" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h2>
          <p className="muted" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>Join us today. It only takes a minute.</p>

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e=>setName(e.target.value)}
                required
                className="field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
                className="field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
                minLength={8}
                className="field"
              />
              <p className="muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Must be at least 8 characters</p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={e=>setPasswordConfirmation(e.target.value)}
                required
                minLength={8}
                className="field"
              />
            </div>

            {error && (
              <div className="card card-pad" style={{ background: '#fee2e2', borderColor: '#fecaca', marginBottom: '1.5rem' }}>
                <p className="muted" style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="muted" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" className="link-primary">
                Login
              </Link>
            </p>

            <p className="muted" style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '1rem' }}>
              <Link to="/" className="link-primary">
                ← Back to Home
              </Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  )
}

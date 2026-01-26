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
      const data = res.data || res;
      
      if (res.error) {
        setError(res.error.message || res.error.data?.message || 'Registration failed. Please try again.');
      } else if (data && data.token) {
        localStorage.setItem('token', data.token);
        // Clear guest_id after successful registration (cart migrated on backend)
        if (guestId) {
          localStorage.removeItem('guest_id');
        }
        navigate('/');
        window.location.reload();
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
    <main style={{ padding: '4rem 0', minHeight: 'calc(100vh - 200px)' }}>
      <div className="container">
        <div style={{
          maxWidth: '450px',
          margin: '0 auto',
          background: '#fff',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2d3748',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}>
            Create Account
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#718096',
            marginBottom: '2rem',
            fontSize: '0.95rem',
          }}>
            Sign up to start shopping
          </p>

          <form onSubmit={submit} className="auth-form">
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3748',
                fontSize: '0.95rem',
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e=>setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3748',
                fontSize: '0.95rem',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3748',
                fontSize: '0.95rem',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <p style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem' }}>
                Must be at least 8 characters
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3748',
                fontSize: '0.95rem',
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={e=>setPasswordConfirmation(e.target.value)}
                required
                minLength={8}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {error && (
              <div className="note error" style={{ marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading
                  ? '#a0aec0'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                marginBottom: '1rem',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p style={{
              textAlign: 'center',
              color: '#718096',
              fontSize: '0.9rem',
            }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Login
              </Link>
            </p>

            <p style={{
              textAlign: 'center',
              color: '#718096',
              fontSize: '0.9rem',
              marginTop: '1rem',
            }}>
              <Link
                to="/"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
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

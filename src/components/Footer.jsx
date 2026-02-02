import React, {useState, useEffect} from 'react';
import api from '../services/api';

export default function Footer(){
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.settings.get();
        if (response.success && response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    
    setLoading(true);
    setStatus(null);
    
    try{
      const result = await api.newsletter.subscribe({email});
      if (result.error) {
        setStatus('error');
      } else {
        setStatus('subscribed');
        setEmail('');
      }
    } catch(err){
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="about">
          <h4>About Us</h4>
          <p>{settings.about_us || settings.footer_text || 'We bring the best vendors together to deliver a delightful shopping experience. Discover quality products from trusted sellers all in one place.'}</p>
        </div>
        <div className="newsletter">
          <h4>Subscribe to Newsletter</h4>
          <p style={{color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '1rem'}}>
            Get the latest updates on new products and special offers
          </p>
          <form onSubmit={subscribe} className="subscribe-form">
            <input 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="Enter your email address" 
              required 
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {status === 'subscribed' && (
            <div className="note">
              ✓ Thanks for subscribing! We'll keep you updated.
            </div>
          )}
          {status === 'error' && (
            <div className="note error">
              ✗ Subscription failed. Please try again.
            </div>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {window.location.hostname || 'Multi-Vendor E-Commerce'}. All rights reserved.
      </div>
    </footer>
  )
}

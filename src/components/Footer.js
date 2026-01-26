import React, {useState} from 'react';
import api from '../services/api';

export default function Footer(){
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const subscribe = async (e) =>{
    e.preventDefault();
    try{
      await api.newsletter.subscribe({email});
      setStatus('subscribed');
      setEmail('');
    }catch(err){
      setStatus('error');
    }
  }

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="about">
          <h4>About Us</h4>
          <p>We bring the best vendors together to deliver a delightful shopping experience.</p>
        </div>
        <div className="newsletter">
          <h4>Subscribe</h4>
          <form onSubmit={subscribe} className="subscribe-form">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email" required />
            <button type="submit">Subscribe</button>
          </form>
          {status === 'subscribed' && <div className="note">Thanks for subscribing!</div>}
          {status === 'error' && <div className="note error">Subscription failed.</div>}
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} · All rights reserved</div>
    </footer>
  )
}

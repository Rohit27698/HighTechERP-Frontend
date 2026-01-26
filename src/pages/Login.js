import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await api.auth.login({email, password});
      const data = res.data || res;
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        setError('Invalid response from server');
      }
    }catch(err){
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={submit} className="auth-form">
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
        {error && <div className="note error">{error}</div>}
      </form>
    </div>
  )
}

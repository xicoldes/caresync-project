import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Auth({ mode }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, formData);
      if (mode === 'login') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        alert(`Welcome back, ${res.data.username}!`);
        navigate('/');
        window.location.reload(); // Refresh to update Nav
      } else {
        alert("Registered! Please sign in.");
        navigate('/signin');
      }
    } catch (err) { alert(err.response?.data?.error || "Auth Failed"); }
  };

  return (
    <div style={styles.authCard}>
      <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {mode === 'register' && (
          <input type="text" placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} style={styles.input} required />
        )}
        <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} style={styles.input} required />
        <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} style={styles.input} required />
        <button type="submit" style={styles.btn}>{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
    </div>
  );
}

const styles = {
  authCard: { maxWidth: '400px', margin: '100px auto', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '4px', border: '1px solid #ddd' },
  btn: { padding: '12px', background: '#1e5bbd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Auth;
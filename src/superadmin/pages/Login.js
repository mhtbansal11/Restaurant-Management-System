import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSuperAdmin } from '../SuperAdminContext';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useSuperAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome, Super Admin!');
      navigate('/superadmin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #000000 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, backgroundImage: "url('/assets/brand/masala-matrix-logo-white-elements.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', margin: '0 auto 16px', fontSize: 0 }}>
            
          </div>
          <h1 style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>Super Admin</h1>
          <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>Masala Matrix Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#1e293b', borderRadius: 16, padding: 32, border: '1px solid #334155' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@masalamatrix.com"
              required
              style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 44px 12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}>
                {show ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : '🚀 Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#475569', fontSize: '0.8rem' }}>
          Restaurant owner? <a href="/login" style={{ color: '#818cf8', textDecoration: 'none' }}>Login here →</a>
        </p>
      </div>
    </div>
  );
}

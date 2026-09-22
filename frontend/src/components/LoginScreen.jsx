import React, { useState } from 'react';
import { Database, Lock, User, Key, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginScreen({ onLogin }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setError('Please enter both User ID and Password.');
      return;
    }

    if (userId.trim().toLowerCase() !== 'ariz17' || password !== 'arbab786') {
      setError('Invalid User ID or Password. Please try again.');
      return;
    }

    setError('');
    // Accept credentials
    onLogin({ userId: userId.trim() });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 20%, rgba(10, 110, 209, 0.18) 0%, transparent 50%), #070b14'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(17, 24, 39, 0.9)',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 32px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), var(--shadow-glow)',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--sap-blue), #38bdf8)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px var(--sap-blue-glow)'
          }}>
            <Database size={30} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
            SAP Cloud Sign In
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Enterprise Workforce & Leave Central (BTP)
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Lock size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-userid" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              SAP User ID
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                id="login-userid"
                type="text" 
                style={{ paddingLeft: '38px' }}
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="login-password" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                id="login-password"
                type="password" 
                style={{ paddingLeft: '38px' }}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            id="btn-login-submit"
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            <span>Authenticate with SAP BTP</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <span>Secured via SAP Cloud Identity Services (IAS) Simulation</span>
        </div>
      </div>
    </div>
  );
}

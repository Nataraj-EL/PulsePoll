import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage({ onNavigateSignup, onNavigateToSignup, onSuccess, onLoginSuccess }) {
  const { login, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSuccessCallback = onSuccess || onLoginSuccess;
  const handleSignupNavCallback = onNavigateSignup || onNavigateToSignup;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password');
      return;
    }

    setSubmitting(true);
    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      if (handleSuccessCallback) handleSuccessCallback();
    }
  };

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="guvi-card" style={{
          maxWidth: '440px',
          margin: '0 auto',
          padding: '40px 32px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '12px' }}>
              Welcome Back
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--guvi-dark)' }}>
              Sign In to PulsePoll
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', marginTop: '6px' }}>
              Access your creator polls and live sessions.
            </p>
          </div>

          {(validationError || error) && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '20px',
              fontWeight: 600,
            }}>
              {(() => {
                const msg = (validationError || error || '').trim();
                return msg ? msg.charAt(0).toUpperCase() + msg.slice(1) : '';
              })()}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary-dominant"
              style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '1rem' }}
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Need a creator account?{' '}
            <button
              onClick={handleSignupNavCallback}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--guvi-green)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

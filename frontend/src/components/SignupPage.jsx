import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function SignupPage({ onNavigateLogin, onNavigateToLogin, onSuccess, onSignupSuccess }) {
  const { signup, error, clearError } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSuccessCallback = onSuccess || onSignupSuccess;
  const handleLoginNavCallback = onNavigateLogin || onNavigateToLogin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    const res = await signup(name.trim(), email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      if (handleSuccessCallback) handleSuccessCallback();
    }
  };

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="guvi-card" style={{
          maxWidth: '460px',
          margin: '0 auto',
          padding: '40px 32px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--guvi-dark)' }}>
              Create Your Account
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', marginTop: '6px' }}>
              Start creating interactive live polls for your audience.
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
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Nataraj EL"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                Password (min 6 characters)
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    margin: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: showPassword ? 'var(--guvi-green)' : '#64748b',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary-dominant"
              style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '1rem' }}
            >
              {submitting ? 'Creating Account...' : 'Sign Up & Continue'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Already have a creator account?{' '}
            <button
              onClick={handleLoginNavCallback}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--guvi-green)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

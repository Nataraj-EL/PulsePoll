import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Header({ onCreatePoll, onEnterCode, onNavigate, onNavigateDashboard, onNavigateLanding }) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleNavLanding = () => {
    if (onNavigate) onNavigate('landing');
    else if (onNavigateLanding) onNavigateLanding();
  };

  const handleNavDashboard = () => {
    if (onNavigate) onNavigate('dashboard');
    else if (onNavigateDashboard) onNavigateDashboard();
  };

  const handleNavLogin = () => {
    if (onNavigate) onNavigate('login');
  };

  const handleLogout = async () => {
    await logout();
    if (onNavigate) onNavigate('landing');
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--guvi-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Header Brand Structure: GUVI Logo | HCL Logo | PulsePoll */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* GUVI Logo */}
          <div
            onClick={handleNavLanding}
            title="PulsePoll"
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/GUVI_logo.png"
              alt="GUVI Logo"
              style={{ height: '24px', width: 'auto', display: 'block' }}
            />
          </div>

          {/* Thin, visually appealing separating bar */}
          <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1' }}></div>

          {/* Attached HCL Logo - Sized to 12px so H-C-L matches G-U-V-I letter height */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/hcl-logo.png"
              alt="HCL Logo"
              style={{ height: '12px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>

          {/* Thin, visually appealing separating bar */}
          <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1' }}></div>

          {/* PulsePoll Product Name */}
          <button
            onClick={handleNavLanding}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--guvi-dark)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Pulse<span style={{ color: 'var(--guvi-green)' }}>Poll</span>
          </button>
        </div>

        {/* Minimal User Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={handleNavLanding} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.925rem' }}>
            Home
          </button>
          <a href="#how-it-works" onClick={handleNavLanding} style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.925rem' }}>
            How it Works
          </a>
          <a href="#features" onClick={handleNavLanding} style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.925rem' }}>
            Features
          </a>
        </nav>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              <button
                onClick={handleNavDashboard}
                className="btn btn-secondary-subtle"
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                Dashboard ({user?.name?.split(' ')[0]})
              </button>
              <button
                onClick={onCreatePoll}
                className="btn btn-primary-dominant"
                style={{ fontSize: '0.875rem', padding: '8px 20px' }}
              >
                Create Poll
              </button>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleNavLogin}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600, padding: '8px 12px' }}
              >
                Sign In
              </button>
              <button
                onClick={onEnterCode}
                className="btn btn-secondary-subtle"
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                Enter Poll Code
              </button>
              <button
                onClick={onCreatePoll}
                className="btn btn-primary-dominant"
                style={{ fontSize: '0.875rem', padding: '8px 20px' }}
              >
                Create a Poll
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

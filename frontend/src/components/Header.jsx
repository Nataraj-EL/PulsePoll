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
      <div className="container header-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '64px',
        paddingTop: '10px',
        paddingBottom: '10px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Header Brand Structure: GUVI Logo | HCL Logo | PulsePoll */}
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* GUVI Logo */}
          <div
            onClick={handleNavLanding}
            title="PulsePoll"
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/GUVI_logo.png"
              alt="GUVI Logo"
              className="header-brand-guvi"
              style={{ height: '22px', width: 'auto', display: 'block' }}
            />
          </div>

          {/* Separating bar */}
          <div className="header-brand-sep" style={{ width: '1px', height: '16px', backgroundColor: '#cbd5e1' }}></div>

          {/* Attached HCL Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/hcl-logo.png"
              alt="HCL Logo"
              className="header-brand-hcl"
              style={{ height: '11px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>

          {/* Separating bar */}
          <div className="header-brand-sep" style={{ width: '1px', height: '16px', backgroundColor: '#cbd5e1' }}></div>

          {/* PulsePoll Product Name */}
          <button
            onClick={handleNavLanding}
            className="header-brand-title"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--guvi-dark)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Pulse<span style={{ color: 'var(--guvi-green)' }}>Poll</span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={handleNavLanding} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
            Home
          </button>
          <a href="#how-it-works" onClick={handleNavLanding} style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
            How it Works
          </a>
          <a href="#features" onClick={handleNavLanding} style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
            Features
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <>
              <button
                onClick={handleNavDashboard}
                className="btn btn-primary-dominant"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="header-actions-link"
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.825rem', cursor: 'pointer', fontWeight: 600, padding: '4px 8px' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleNavLogin}
                className="header-actions-link"
                style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, padding: '6px 10px' }}
              >
                Sign In
              </button>
              <button
                onClick={onEnterCode}
                className="btn btn-primary-dominant"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                Poll Code
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import React from 'react';

export function Header({ onCreatePoll, onEnterCode }) {
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
        {/* HCL GUVI Branding & Product Descriptor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Official HCL GUVI Brand Logo */}
          <a
            href="https://www.guvi.in"
            target="_blank"
            rel="noopener noreferrer"
            title="HCL GUVI"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/GUVI_logo.png"
              alt="HCL GUVI Logo"
              style={{ height: '28px', width: 'auto', display: 'block' }}
            />
            <span style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#0056b3',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              HCL <span style={{ color: '#00b755' }}>GUVI</span>
            </span>
          </a>

          {/* Vertical Separator */}
          <div style={{ width: '1px', height: '22px', backgroundColor: '#cbd5e1' }}></div>

          {/* Product Descriptor (Replaces competing PulsePoll logo in header) */}
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--color-text-main)',
            letterSpacing: '-0.01em',
          }}>
            Real-Time Audience Live Polling
          </span>
        </div>

        {/* Minimal Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.925rem' }}>
            How it Works
          </a>
          <a href="#features" style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.925rem' }}>
            Features
          </a>
        </nav>

        {/* CTAs: Dominant "Create a Poll" + Secondary "Enter Poll Code" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        </div>
      </div>
    </header>
  );
}

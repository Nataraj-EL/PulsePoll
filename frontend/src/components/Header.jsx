import React, { useState } from 'react';

export function Header({ onCreatePoll, onJoinPoll }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        {/* Brand Co-Branding Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Official HCL GUVI Logo Asset */}
          <a href="https://www.guvi.in" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/GUVI_logo.png"
              alt="HCL GUVI Logo"
              style={{ height: '30px', width: 'auto', display: 'block' }}
            />
          </a>

          {/* Vertical Separator */}
          <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></div>

          {/* PulsePoll Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(180deg, #56f68f 0%, #0ad652 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(10, 214, 82, 0.3)',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#0d381c',
                borderRadius: '50%',
              }}></span>
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--guvi-dark)',
              letterSpacing: '-0.02em',
            }}>
              Pulse<span style={{ color: 'var(--guvi-green)' }}>Poll</span>
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
        }} className="desktop-nav">
          <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.925rem' }}>
            How it Works
          </a>
          <a href="#live-demo" style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.925rem' }}>
            Live Preview
          </a>
          <a href="#features" style={{ textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.925rem' }}>
            Features
          </a>
        </nav>

        {/* CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onJoinPoll}
            className="btn btn-guvi-outline"
            style={{ fontSize: '0.875rem', padding: '8px 16px' }}
          >
            Join Poll
          </button>
          <button
            onClick={onCreatePoll}
            className="btn btn-guvi-primary"
            style={{ fontSize: '0.875rem', padding: '8px 18px' }}
          >
            + Create Poll
          </button>
        </div>
      </div>
    </header>
  );
}

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
        {/* Header Branding Structure: Guvi Logo | HCL Logo | PulsePoll */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Official GUVI Logo */}
          <a
            href="https://www.guvi.in"
            target="_blank"
            rel="noopener noreferrer"
            title="GUVI Official Site"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/GUVI_logo.png"
              alt="GUVI Logo"
              style={{ height: '26px', width: 'auto', display: 'block' }}
            />
          </a>

          {/* Thin, visually appealing separating bar */}
          <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db' }}></div>

          {/* Attached Official HCL Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/hcl-logo.png"
              alt="HCL Logo"
              style={{ height: '22px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>

          {/* Thin, visually appealing separating bar */}
          <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db' }}></div>

          {/* PulsePoll Product Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(180deg, #56f68f 0%, #0ad652 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(10, 214, 82, 0.3)',
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                backgroundColor: '#063816',
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

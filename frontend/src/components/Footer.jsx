import React from 'react';

export function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--guvi-border)',
      backgroundColor: '#ffffff',
      padding: '28px 0',
      color: 'var(--color-text-muted)',
      fontSize: '0.875rem',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Footer Brand Logos: GUVI Logo | HCL Logo | PulsePoll */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/GUVI_logo.png"
            alt="GUVI Logo"
            style={{ height: '20px', width: 'auto' }}
          />
          <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1' }}></div>
          <img
            src="/hcl-logo.png"
            alt="HCL Logo"
            style={{ height: '11px', width: 'auto' }}
          />
          <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1' }}></div>
          <span style={{ fontWeight: 800, color: 'var(--guvi-dark)', fontSize: '0.95rem' }}>
            Pulse<span style={{ color: 'var(--guvi-green)' }}>Poll</span>
          </span>
        </div>

        {/* Minimal Copyright */}
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} HCL GUVI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import React from 'react';

export function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--guvi-border)',
      backgroundColor: '#ffffff',
      padding: '32px 0',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/GUVI_logo.png"
            alt="GUVI Logo"
            style={{ height: '22px', opacity: 0.8 }}
          />
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontWeight: 700, color: 'var(--guvi-dark)' }}>PulsePoll</span>
        </div>

        <div style={{ color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} PulsePoll Platform. Inspired by HCL GUVI design standards.
        </div>
      </div>
    </footer>
  );
}

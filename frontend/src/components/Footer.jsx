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
        {/* HCL GUVI Logo Brand Mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/GUVI_logo.png"
            alt="HCL GUVI Logo"
            style={{ height: '22px', width: 'auto' }}
          />
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            color: '#0056b3',
          }}>
            HCL <span style={{ color: '#00b755' }}>GUVI</span>
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

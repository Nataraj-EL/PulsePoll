import React from 'react';

export function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--guvi-border)',
      backgroundColor: '#ffffff',
      padding: '24px 0',
      color: 'var(--color-text-muted)',
      fontSize: '0.875rem',
      textAlign: 'center',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
          © {new Date().getFullYear()} HCL GUVI x Nataraj EL. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

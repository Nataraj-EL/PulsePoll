import React from 'react';
import { DotMatrixBackground } from './DotMatrixBackground';

export function FeatureGrid() {
  const features = [
    {
      number: '01',
      icon: '🔗',
      title: 'Shareable Poll Links',
      desc: 'Get a unique link and code instantly to share across any communication channel.',
    },
    {
      number: '02',
      icon: '⚡',
      title: 'Instant Participation',
      desc: 'Voters tap the link or enter the code to respond immediately without creating an account.',
    },
    {
      number: '03',
      icon: '📈',
      title: 'Real-Time Live Results',
      desc: 'Watch response counts and percentages update dynamically as votes are cast.',
    },
    {
      number: '04',
      icon: '🎛️',
      title: 'Simple Poll Control',
      desc: 'Easily create, view, and manage active polls from your Creator Workspace.',
    },
  ];

  return (
    <section id="features" style={{ position: 'relative', overflow: 'hidden', padding: '72px 0' }}>
      <DotMatrixBackground />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px auto' }}>
          <div className="eyebrow-chip eyebrow-chip-features" style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.9rem' }}>🚀</span>
            <span>Key Benefits</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.35rem)', fontWeight: 800, color: 'var(--guvi-dark)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Everything You Need for Live Polling
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '10px', lineHeight: 1.5 }}>
            Built for simple, fast, and engaging audience feedback.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: '24px',
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="guvi-card feature-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px 24px',
                border: '1px solid var(--guvi-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    boxShadow: '0 2px 6px rgba(10, 214, 82, 0.1)',
                  }}>
                    {f.icon}
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'var(--guvi-green)',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    letterSpacing: '0.04em',
                  }}>
                    {f.number}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--guvi-dark)', marginBottom: '8px', lineHeight: 1.3 }}>
                  {f.title}
                </h3>
                
                <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

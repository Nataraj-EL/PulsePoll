import React from 'react';
import { DotMatrixBackground } from './DotMatrixBackground';

export function FeatureGrid() {
  const features = [
    {
      number: '01',
      title: 'Shareable Poll Links',
      desc: 'Get a unique link and code instantly to share across any channel.',
    },
    {
      number: '02',
      title: 'No Participant Registration',
      desc: 'Voters tap the link or enter the code to respond immediately without creating an account.',
    },
    {
      number: '03',
      title: 'Live Results',
      desc: 'Watch response counts and percentages update live as votes are cast.',
    },
    {
      number: '04',
      title: 'Simple Poll Management',
      desc: 'Easily create, view, and manage your active polls from one simple dashboard.',
    },
  ];

  return (
    <section id="features" style={{ position: 'relative', overflow: 'hidden', padding: '64px 0' }}>
      <DotMatrixBackground />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--guvi-dark)', letterSpacing: '-0.02em' }}>
            Everything You Need for Audience Polling
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
            Built for simple, fast, and engaging audience feedback.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: '24px',
        }}>
          {features.map((f, i) => (
            <div key={i} className="guvi-card guvi-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--guvi-green)',
                letterSpacing: '0.05em',
              }}>
                {f.number}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--guvi-dark)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

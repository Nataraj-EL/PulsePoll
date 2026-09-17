import React from 'react';
import { DotMatrixBackground } from './DotMatrixBackground';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: '✏️',
      title: 'Create a Poll',
      desc: 'Type your question and response options in seconds with single or multiple choices.',
    },
    {
      step: '02',
      icon: '🔗',
      title: 'Share the Link',
      desc: 'Instantly get a unique shareable link or code for your participants.',
    },
    {
      step: '03',
      icon: '📲',
      title: 'Collect Votes',
      desc: 'Participants respond on any smartphone or browser—no signup or app needed.',
    },
    {
      step: '04',
      icon: '📊',
      title: 'See Results Live',
      desc: 'Watch incoming responses update dynamically on screen in real time.',
    },
  ];

  return (
    <section id="how-it-works" style={{ position: 'relative', overflow: 'hidden', padding: '72px 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--guvi-border)', borderBottom: '1px solid var(--guvi-border)' }}>
      <DotMatrixBackground />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px auto' }}>
          <div className="eyebrow-chip eyebrow-chip-process" style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.9rem' }}>⚡</span>
            <span>Easy 4-Step Process</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.35rem)', fontWeight: 800, color: 'var(--guvi-dark)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            How It Works
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '10px', lineHeight: 1.5 }}>
            From setup to live real-time feedback in four seamless steps.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '24px',
        }}>
          {steps.map((s) => (
            <div
              key={s.step}
              className="guvi-card step-card-hover"
              style={{
                position: 'relative',
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
                    {s.icon}
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'var(--guvi-navy)',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    letterSpacing: '0.04em',
                  }}>
                    STEP {s.step}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--guvi-dark)', marginBottom: '8px', lineHeight: 1.3 }}>
                  {s.title}
                </h3>
                
                <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

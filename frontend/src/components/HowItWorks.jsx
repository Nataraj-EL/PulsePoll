import React from 'react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Create a Poll',
      desc: 'Type your question and response options in seconds.',
    },
    {
      step: '02',
      title: 'Share the Link',
      desc: 'Instantly get a unique shareable link or code for your audience.',
    },
    {
      step: '03',
      title: 'Collect Votes',
      desc: 'Participants respond on any smartphone or browser—no signup required.',
    },
    {
      step: '04',
      title: 'See Results Live',
      desc: 'Watch incoming responses update on screen in real time.',
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: '64px 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--guvi-border)', borderBottom: '1px solid var(--guvi-border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '12px' }}>
            Easy 4-Step Process
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--guvi-dark)', letterSpacing: '-0.02em' }}>
            How It Works
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
            From setup to live results in four easy steps.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
          gap: '24px',
        }}>
          {steps.map((s) => (
            <div key={s.step} className="guvi-card" style={{ position: 'relative' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--guvi-green)',
                marginBottom: '12px',
              }}>
                {s.step}
              </div>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--guvi-dark)', marginBottom: '8px' }}>
                {s.title}
              </h3>
              
              <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

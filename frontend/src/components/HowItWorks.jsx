import React from 'react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Create',
      desc: 'Set up single or multiple-choice questions with customized options in under 30 seconds.',
      icon: '✍️',
    },
    {
      step: '02',
      title: 'Share',
      desc: 'Generate a 6-digit numeric PIN code or direct QR code for your live audience.',
      icon: '🔗',
    },
    {
      step: '03',
      title: 'Vote',
      desc: 'Participants scan or enter the code on any mobile browser—no account required.',
      icon: '📲',
    },
    {
      step: '04',
      title: 'Watch Live',
      desc: 'Watch audience responses stream instantly into clean, animated presenter charts.',
      icon: '📊',
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: '60px 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--guvi-border)', borderBottom: '1px solid var(--guvi-border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '12px' }}>
            💡 Simple 4-Step Process
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--guvi-dark)', letterSpacing: '-0.02em' }}>
            How PulsePoll Works
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
            Designed for seamless interaction between presenters and live audiences.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
        }}>
          {steps.map((s) => (
            <div key={s.step} className="guvi-card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--guvi-green)',
                opacity: 0.8,
              }}>
                {s.step}
              </div>

              <div style={{ fontSize: '2.25rem', marginBottom: '16px' }}>{s.icon}</div>
              
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

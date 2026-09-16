import React from 'react';

export function FeatureGrid() {
  const features = [
    {
      title: 'Zero Participant Friction',
      desc: 'Participants jump straight into voting via short 6-digit PIN codes or QR scans without creating an account.',
      icon: '🔒',
    },
    {
      title: 'Real-Time Results Stream',
      desc: 'Presenter dashboard updates dynamically as votes are cast, creating an engaging live audience feedback loop.',
      icon: '⚡',
    },
    {
      title: 'Instant QR & Share Links',
      desc: 'Generate downloadable QR codes and short shareable URLs for classroom or conference presentations.',
      icon: '🎯',
    },
    {
      title: 'Intuitive Management',
      desc: 'Clean, distraction-free presenter hub to activate polls, lock responses, or export session metrics.',
      icon: '🛠️',
    },
  ];

  return (
    <section id="features" style={{ padding: '64px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '12px' }}>
            🌟 Key Advantages
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--guvi-dark)', letterSpacing: '-0.02em' }}>
            Built for High Engagement
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
            PulsePoll combines extreme ease of use with robust live response visualization.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}>
          {features.map((f, i) => (
            <div key={i} className="guvi-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--guvi-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                {f.icon}
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

import React from 'react';

export function FeatureGrid() {
  const features = [
    {
      title: 'Shareable Poll Links',
      desc: 'Get a unique link and code instantly to share with your audience across any channel.',
      icon: '🔗',
    },
    {
      title: 'No Participant Registration',
      desc: 'Voters tap the link or enter the code to respond immediately without creating an account.',
      icon: '📲',
    },
    {
      title: 'Live Results',
      desc: 'Watch response counts and percentages update live as votes are cast.',
      icon: '📊',
    },
    {
      title: 'Simple Poll Management',
      desc: 'Easily create, view, and manage your active polls from one simple dashboard.',
      icon: '🛠️',
    },
  ];

  return (
    <section id="features" style={{ padding: '64px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '12px' }}>
            🌟 Key Benefits
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--guvi-dark)', letterSpacing: '-0.02em' }}>
            Everything You Need for Audience Polling
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
            Built for simple, fast, and engaging audience feedback.
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

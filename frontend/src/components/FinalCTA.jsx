import React from 'react';

export function FinalCTA({ onCreatePoll, onJoinPoll }) {
  return (
    <section style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        <div style={{
          background: 'radial-gradient(130% 220% at 100% 50%, rgba(10, 214, 82, 0.2), transparent 50%), var(--guvi-navy)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '56px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            color: '#ffffff',
          }}>
            Ready to see every response live?
          </h2>
          <p style={{
            fontSize: '1.15rem',
            color: '#94a3b8',
            maxWidth: '560px',
            margin: '0 auto 32px auto',
          }}>
            Launch your first live poll in seconds. Fast, interactive, and completely free for presenters and participants.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={onCreatePoll}
              className="btn btn-guvi-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem' }}
            >
              🚀 Create Your Poll Now
            </button>

            <button
              onClick={onJoinPoll}
              className="btn btn-guvi-outline"
              style={{ padding: '14px 28px', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Enter Room Code
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

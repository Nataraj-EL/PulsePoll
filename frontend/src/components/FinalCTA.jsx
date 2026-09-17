import React from 'react';
import { DotMatrixBackground } from './DotMatrixBackground';

export function FinalCTA({ onCreatePoll, onEnterCode }) {
  return (
    <section style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(130% 220% at 100% 50%, rgba(10, 214, 82, 0.25), transparent 50%), var(--guvi-dark)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '56px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <DotMatrixBackground dotColor="255, 255, 255" glowColor="10, 214, 82" />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
              color: '#ffffff',
            }}>
              Ready to create your first poll?
            </h2>
            <p style={{
              fontSize: '1.15rem',
              color: '#94a3b8',
              maxWidth: '540px',
              margin: '0 auto 36px auto',
            }}>
              Start collecting live audience responses in seconds. Share your poll link and watch responses update live.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* DOMINANT PRIMARY CTA */}
              <button
                onClick={onCreatePoll}
                className="btn btn-primary-dominant"
                style={{ padding: '16px 36px', fontSize: '1.1rem' }}
              >
                Create a Poll
              </button>

              {/* SECONDARY SUBTLE CTA */}
              <button
                onClick={onEnterCode}
                className="btn btn-secondary-subtle"
                style={{ padding: '16px 28px', color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)' }}
              >
                Enter Poll Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

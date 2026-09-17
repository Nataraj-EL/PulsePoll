import React from 'react';
import { DotMatrixBackground } from './DotMatrixBackground';

export function LandingHero({ onCreatePoll, onEnterCode }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(40px, 7vw, 72px) 0 clamp(32px, 5vw, 56px) 0', textAlign: 'center' }}>
      <DotMatrixBackground />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {/* User Badge */}
          <div style={{ marginBottom: '20px' }}>
            <span className="guvi-badge guvi-badge-green">
              Live Audience Polling
            </span>
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: '-0.03em',
            color: 'var(--guvi-dark)',
            marginBottom: '20px',
          }}>
            Create a poll. Share the link.<br />
            <span style={{
              background: 'linear-gradient(180deg, #0ad652 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Get responses live.
            </span>
          </h1>

          {/* User-focused Supporting Copy */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-text-muted)',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6,
          }}>
            Create a poll in seconds, instantly get a shareable link, send it to your participants, and watch responses come in live.
          </p>

          {/* Action CTAs */}
          <div className="btn-group-responsive" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            flexWrap: 'wrap',
          }}>
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
              onClick={() => onEnterCode && onEnterCode()}
              className="btn btn-secondary-subtle"
              style={{ padding: '16px 28px', fontSize: '1.1rem' }}
            >
              Enter Poll Code
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

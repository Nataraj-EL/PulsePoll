import React, { useState } from 'react';

export function LandingHero({ onCreatePoll, onJoinWithPin }) {
  const [pinCode, setPinCode] = useState('');

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinCode.trim()) {
      onJoinWithPin(pinCode.trim());
    }
  };

  return (
    <section style={{ padding: '64px 0 40px 0', textAlign: 'center' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* GUVI Inspired Badge */}
        <div style={{ marginBottom: '24px' }}>
          <span className="guvi-badge guvi-badge-green">
            ⚡ Instant Audience Engagement Platform
          </span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: 'var(--guvi-dark)',
          marginBottom: '24px',
        }}>
          Create. Share. Vote.<br />
          <span style={{
            background: 'linear-gradient(180deg, #0ad652 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            See results live.
          </span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p style={{
          fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
          color: 'var(--color-text-muted)',
          maxWidth: '680px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6,
        }}>
          PulsePoll lets anyone create a live poll, share it instantly with a 6-digit PIN or QR code, and watch audience responses update in real time.
        </p>

        {/* CTA Buttons Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}>
          <button
            onClick={onCreatePoll}
            className="btn btn-guvi-primary"
            style={{ padding: '14px 32px', fontSize: '1.05rem' }}
          >
            🚀 Create a Poll
          </button>
          
          <a
            href="#live-demo"
            className="btn btn-guvi-outline"
            style={{ padding: '14px 28px', fontSize: '1.05rem' }}
          >
            👀 Watch Live Demo
          </a>
        </div>

        {/* Quick Join Poll Box */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid var(--guvi-border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          maxWidth: '480px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px', textAlign: 'left' }}>
            📲 Already have a poll code? Join instantly:
          </div>
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter 6-digit PIN (e.g. 849201)"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-guvi-secondary"
              style={{ padding: '12px 20px' }}
            >
              Join Poll
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

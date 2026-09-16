import React, { useState } from 'react';

export function LandingHero({ onCreatePoll, onEnterCode }) {
  const [pollCode, setPollCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (pollCode.trim()) {
      onEnterCode(pollCode.trim());
    }
  };

  return (
    <section style={{ padding: '72px 0 56px 0', textAlign: 'center' }}>
      <div className="container">
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {/* User Badge */}
          <div style={{ marginBottom: '24px' }}>
            <span className="guvi-badge guvi-badge-green">
              Live Audience Polling
            </span>
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--guvi-dark)',
            marginBottom: '24px',
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
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
            color: 'var(--color-text-muted)',
            maxWidth: '680px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6,
          }}>
            Create a poll in seconds, instantly get a shareable link, send it to your participants, and watch responses come in live.
          </p>

          {/* Action CTAs: Dominant Primary "Create a Poll" + Secondary "Enter Poll Code" */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '32px',
          }}>
            {/* DOMINANT PRIMARY CTA */}
            <button
              onClick={onCreatePoll}
              className="btn btn-primary-dominant"
              style={{ padding: '18px 40px', fontSize: '1.15rem' }}
            >
              Create a Poll
            </button>
            
            {/* SECONDARY SUBTLE CTA */}
            <button
              onClick={() => {
                setShowCodeInput(!showCodeInput);
                if (onEnterCode && !showCodeInput) onEnterCode();
              }}
              className="btn btn-secondary-subtle"
              style={{ padding: '18px 32px', fontSize: '1.15rem' }}
            >
              Enter Poll Code
            </button>
          </div>

          {/* Secondary Poll Code Input */}
          {showCodeInput && (
            <div style={{
              background: '#ffffff',
              border: '1.5px solid var(--guvi-green)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              maxWidth: '420px',
              margin: '0 auto 20px auto',
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.3s ease',
            }}>
              <form onSubmit={handleCodeSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit poll code (e.g. 849201)"
                  value={pollCode}
                  onChange={(e) => setPollCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
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
                  style={{ padding: '10px 18px', backgroundColor: 'var(--guvi-dark)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                >
                  Join
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

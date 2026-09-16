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
    <section style={{ padding: '64px 0 48px 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {/* User Badge */}
          <div style={{ marginBottom: '20px' }}>
            <span className="guvi-badge guvi-badge-green">
              ✦ Live Audience Polling
            </span>
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
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
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--color-text-muted)',
            maxWidth: '660px',
            margin: '0 auto 36px auto',
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
            marginBottom: '40px',
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
              onClick={() => {
                setShowCodeInput(!showCodeInput);
                if (onEnterCode && !showCodeInput) onEnterCode();
              }}
              className="btn btn-secondary-subtle"
              style={{ padding: '16px 28px', fontSize: '1.05rem' }}
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
              margin: '0 auto 40px auto',
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

        {/* Real Product Experience Mockup (No technical jargon or fake engineering stats) */}
        <div className="guvi-card" style={{
          maxWidth: '840px',
          margin: '0 auto',
          padding: '0',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1.5px solid #cbd5e1',
        }}>
          {/* Mock Window Header Bar */}
          <div style={{
            backgroundColor: '#1e1e22',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff',
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                pulsepoll.app/p/849201
              </span>
            </div>

            <div style={{
              backgroundColor: 'rgba(10, 214, 82, 0.15)',
              color: '#56f68f',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid rgba(86, 246, 143, 0.3)',
            }}>
              ● Live Poll
            </div>
          </div>

          {/* Product Flow Visual Content */}
          <div style={{ padding: '32px 28px', backgroundColor: '#ffffff', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'center' }}>
              
              {/* Left Column: Creator Question & Shareable Link */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--guvi-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Shareable Poll Link
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--guvi-dark)', marginTop: '6px' }}>
                  "Which session topic would you like to cover next?"
                </h4>
                
                <div style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #0ad652',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                }}>
                  <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>
                    🔗 pulsepoll.app/p/849201
                  </span>
                  <span style={{ backgroundColor: 'var(--guvi-green-light)', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Copy Link
                  </span>
                </div>
              </div>

              {/* Right Column: Live Responses Updating */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--guvi-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Live Responses
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    Updating Live
                  </span>
                </div>

                {/* Option 1 */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Web Development & React</span>
                    <span>18 votes</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '65%', height: '100%', backgroundColor: '#0ad652', borderRadius: '6px' }}></div>
                  </div>
                </div>

                {/* Option 2 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Cloud Architecture & APIs</span>
                    <span>10 votes</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '35%', height: '100%', backgroundColor: '#2563eb', borderRadius: '6px' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

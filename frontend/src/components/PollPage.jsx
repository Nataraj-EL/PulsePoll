import React, { useState, useEffect } from 'react';
import { getPollByIdOrCode } from '../services/api';

export function PollPage({ pollCode, onNavigate }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [voted, setVoted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPoll() {
      if (!pollCode) {
        setError('No poll code provided.');
        setLoading(false);
        return;
      }

      setLoading(false);
      setLoading(true);
      setError(null);

      const res = await getPollByIdOrCode(pollCode);
      if (res.ok && res.data?.poll) {
        setPoll(res.data.poll);
      } else {
        const msg = res.data?.message || `Poll with code #${pollCode} could not be found.`;
        setError(msg.charAt(0).toUpperCase() + msg.slice(1));
      }
      setLoading(false);
    }

    loadPoll();
  }, [pollCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoteSubmit = (e) => {
    e.preventDefault();
    setVoted(true);
  };

  const toggleMultipleOption = (optionId) => {
    if (selectedMultiple.includes(optionId)) {
      setSelectedMultiple(selectedMultiple.filter((id) => id !== optionId));
    } else {
      setSelectedMultiple([...selectedMultiple, optionId]);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-indicator" style={{ margin: '0 auto 16px auto', width: '16px', height: '16px' }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
            Loading poll #{pollCode}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div style={{ padding: '60px 0', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="guvi-card" style={{
            maxWidth: '520px',
            margin: '0 auto',
            padding: '40px 32px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <span className="guvi-badge" style={{ backgroundColor: '#fef2f2', color: '#991b1b', marginBottom: '16px' }}>
              Poll Not Available
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--guvi-dark)', marginBottom: '12px' }}>
              Poll Code #{pollCode} Not Found
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {error || 'This poll may have been deleted, closed, or the poll link is incorrect.'}
            </p>
            <button
              onClick={() => onNavigate && onNavigate('landing')}
              className="btn btn-primary-dominant"
              style={{ width: '100%', padding: '12px' }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px 0', minHeight: '80vh' }}>
      <div className="container">
        <div className="guvi-card" style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--guvi-border)',
        }}>
          {/* Top Info Bar */}
          <div style={{
            backgroundColor: 'var(--guvi-navy)',
            color: '#ffffff',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--guvi-green)', letterSpacing: '0.08em' }}>
                {poll.status === 'active' ? '● LIVE POLL' : 'DRAFT POLL'} • CODE #{poll.code}
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px', lineHeight: 1.3 }}>
                {poll.question}
              </h1>
            </div>

            <button
              onClick={handleCopyLink}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? 'Link Copied!' : 'Copy Share Link'}
            </button>
          </div>

          {/* Poll Options Form */}
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                {poll.choice_type === 'single' ? 'Select 1 option:' : 'Select any options:'}
              </span>
              <span className="guvi-badge guvi-badge-blue" style={{ fontSize: '0.75rem' }}>
                Public Participant View
              </span>
            </div>

            {voted ? (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                textAlign: 'center',
              }}>
                <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '10px' }}>
                  Response Recorded
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                  Thank you for participating!
                </h3>
                <p style={{ color: '#15803d', fontSize: '0.925rem' }}>
                  Your vote has been registered for poll #{poll.code}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {poll.options.map((opt) => {
                  const isChecked = poll.choice_type === 'single'
                    ? selectedOption === opt.id
                    : selectedMultiple.includes(opt.id);

                  return (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-sm)',
                        border: isChecked ? '2px solid var(--guvi-green)' : '1px solid #cbd5e1',
                        backgroundColor: isChecked ? 'var(--guvi-green-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--guvi-dark)' }}>
                        {opt.text}
                      </span>
                      <input
                        type={poll.choice_type === 'single' ? 'radio' : 'checkbox'}
                        name="poll_option"
                        value={opt.id}
                        checked={isChecked}
                        onChange={() => {
                          if (poll.choice_type === 'single') {
                            setSelectedOption(opt.id);
                          } else {
                            toggleMultipleOption(opt.id);
                          }
                        }}
                        style={{ accentColor: 'var(--guvi-green)', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </label>
                  );
                })}

                <button
                  type="submit"
                  disabled={poll.choice_type === 'single' ? !selectedOption : selectedMultiple.length === 0}
                  className="btn btn-primary-dominant"
                  style={{
                    marginTop: '12px',
                    padding: '14px',
                    fontSize: '1rem',
                    opacity: (poll.choice_type === 'single' ? !selectedOption : selectedMultiple.length === 0) ? 0.6 : 1,
                  }}
                >
                  Submit Vote
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

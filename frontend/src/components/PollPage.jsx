import React, { useState, useEffect } from 'react';
import { getPollByIdOrCode, castVote } from '../services/api';
import { LiveResultsView } from './LiveResultsView';

function getOrCreateVoterId() {
  let id = localStorage.getItem('pulsepoll_voter_id');
  if (!id) {
    id = `voter_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    localStorage.setItem('pulsepoll_voter_id', id);
  }
  return id;
}

export function PollPage({ pollCode, onNavigate, initialTab }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [voted, setVoted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPoll() {
      if (!pollCode) {
        setError('No poll code provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Check if user already voted locally or requested results route
      const alreadyVoted = localStorage.getItem(`pulsepoll_voted_${pollCode}`);
      if (alreadyVoted || initialTab === 'results') {
        setVoted(true);
      }

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
  }, [pollCode, initialTab]);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/p/${pollCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const optionIds = poll.choice_type === 'single'
      ? (selectedOption ? [selectedOption] : [])
      : selectedMultiple;

    if (optionIds.length === 0) {
      setSubmitError('Please select at least one option to vote.');
      return;
    }

    const voterId = getOrCreateVoterId();
    setSubmitting(true);

    const res = await castVote(pollCode, { optionIds, voterId });
    setSubmitting(false);

    if (res.ok) {
      localStorage.setItem(`pulsepoll_voted_${pollCode}`, 'true');
      setVoted(true);
    } else {
      const msg = res.data?.message || 'Failed to submit vote. Please try again.';
      const formatted = msg.charAt(0).toUpperCase() + msg.slice(1);
      
      if (res.status === 409 || msg.toLowerCase().includes('already voted')) {
        localStorage.setItem(`pulsepoll_voted_${pollCode}`, 'true');
        setVoted(true);
      } else {
        setSubmitError(formatted);
      }
    }
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--color-text-muted)',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}>
          <span className="pulse-indicator" style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          <span>Loading poll #{pollCode}...</span>
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
    <div style={{ padding: 'clamp(20px, 4vw, 50px) 0', minHeight: '80vh' }}>
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
          {/* Top Info Header Bar */}
          <div style={{
            backgroundColor: 'var(--guvi-navy)',
            color: '#ffffff',
            padding: 'clamp(14px, 3vw, 18px) clamp(16px, 4vw, 32px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--guvi-green)', letterSpacing: '0.08em' }}>
              {poll.status === 'active' ? (
                <>
                  <span className="pulse-indicator" style={{ width: '8px', height: '8px', marginLeft: '4px', marginRight: '12px', flexShrink: 0 }} />
                  <span>LIVE POLL</span>
                </>
              ) : (
                <span>DRAFT POLL</span>
              )}
              <span style={{ margin: '0 8px', color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
              <span style={{ color: '#ffffff' }}>CODE #{poll.code}</span>
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
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? 'Link Copied!' : 'Copy Share Link'}
            </button>
          </div>

          {/* Progressive Stage Body */}
          <div style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
            <h1 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', fontWeight: 800, color: 'var(--guvi-dark)', marginBottom: '20px', lineHeight: 1.35, wordBreak: 'break-word' }}>
              {poll.question}
            </h1>

            {/* STAGE 2: Voted / Progressive Transition to Live Results */}
            {voted ? (
              <div>
                {/* Smooth Response Recorded Banner */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  fontWeight: 600,
                  fontSize: '0.925rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>✓</span>
                    <span>Response Recorded – Thank you for participating!</span>
                  </div>
                </div>

                {/* Vertical Bar Chart Live Results */}
                <LiveResultsView
                  pollCode={poll.code}
                  question={poll.question}
                  options={poll.options}
                />
              </div>
            ) : (
              /* STAGE 1: Voting Form */
              <>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    {poll.choice_type === 'single' ? 'Select 1 option:' : 'Select any options:'}
                  </span>
                </div>

                {submitError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    marginBottom: '20px',
                    fontWeight: 600,
                  }}>
                    {submitError}
                  </div>
                )}

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
                          padding: '14px clamp(12px, 3vw, 20px)',
                          borderRadius: 'var(--radius-sm)',
                          border: isChecked ? '2px solid var(--guvi-green)' : '1px solid #cbd5e1',
                          backgroundColor: isChecked ? 'var(--guvi-green-light)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          gap: '12px',
                        }}
                      >
                        <span style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--guvi-dark)', wordBreak: 'break-word', minWidth: 0, flex: 1 }}>
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
                          style={{ accentColor: 'var(--guvi-green)', width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                        />
                      </label>
                    );
                  })}

                  <button
                    type="submit"
                    disabled={submitting || (poll.choice_type === 'single' ? !selectedOption : selectedMultiple.length === 0)}
                    className="btn btn-primary-dominant"
                    style={{
                      marginTop: '12px',
                      padding: '14px',
                      fontSize: '1rem',
                      opacity: (submitting || (poll.choice_type === 'single' ? !selectedOption : selectedMultiple.length === 0)) ? 0.6 : 1,
                    }}
                  >
                    {submitting ? 'Submitting Vote...' : 'Submit Vote'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

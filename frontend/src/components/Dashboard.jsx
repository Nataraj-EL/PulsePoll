import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserPolls, publishPoll } from '../services/api';
import { CreatePollModal } from './CreatePollModal';
export function Dashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedCodeOnly, setCopiedCodeOnly] = useState(null);

  const handleCopyCodeOnly = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeOnly(code);
    setTimeout(() => setCopiedCodeOnly(null), 2000);
  };

  const fetchPolls = async () => {
    setLoadingPolls(true);
    try {
      const res = await getUserPolls();
      if (res.ok && res.data?.polls) {
        setPolls(res.data.polls);
      }
    } catch (err) {
      console.error('Failed to fetch polls:', err);
    } finally {
      setLoadingPolls(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPolls();
    }
  }, [user]);

  if (!user) return null;

  const handleCopyLink = (code) => {
    const shareableUrl = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePublishDraft = async (pollId) => {
    const res = await publishPoll(pollId);
    if (res.ok) {
      fetchPolls();
    }
  };

  return (
    <div style={{ padding: 'clamp(24px, 5vw, 48px) 0', minHeight: '75vh' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          {/* Creator Header Bar */}
          <div className="dashboard-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--guvi-border)',
          }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--guvi-dark)' }}>
                {user.isNewUser ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Manage your active interactive polls and view live audience responses.
              </p>
            </div>

            <div className="dashboard-header-cta" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="btn btn-primary-dominant"
                style={{ padding: '10px 20px', fontSize: '0.95rem' }}
              >
                Create New Poll
              </button>
            </div>
          </div>

          {/* Poll Management Section */}
          <div className="guvi-card">
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--guvi-dark)' }}>
                Your Polls ({polls.length})
              </h3>
            </div>

            {loadingPolls ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div className="pulse-indicator" style={{ margin: '0 auto 12px auto', width: '14px', height: '14px' }}></div>
                Loading your polls...
              </div>
            ) : polls.length === 0 ? (
              <div style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: 'var(--radius-sm)',
              }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '18px', maxWidth: '440px', margin: '0 auto 18px auto' }}>
                  You haven't created any polls yet. Launch your first interactive poll to start collecting live audience feedback.
                </p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="btn btn-primary-dominant"
                  style={{ fontSize: '0.95rem', padding: '12px 24px' }}
                >
                  Create Your First Poll
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {polls.map((poll) => (
                  <div key={poll.id} style={{
                    border: '1px solid var(--guvi-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color 0.2s ease',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <span className={`guvi-badge ${poll.status === 'active' ? 'guvi-badge-green' : 'guvi-badge-blue'}`}>
                        {poll.status === 'active' ? 'Live Poll' : 'Draft Poll'}
                      </span>
                      <div
                        onClick={(e) => handleCopyCodeOnly(e, poll.code)}
                        title="Click to copy poll code"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: 'var(--guvi-dark)',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>Code {poll.code}</span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: copiedCodeOnly === poll.code ? 'var(--guvi-green)' : '#64748b',
                            transition: 'color 0.15s ease',
                          }}
                        >
                          {copiedCodeOnly === poll.code ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.075rem', fontWeight: 700, color: 'var(--guvi-dark)', marginBottom: '8px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                      {poll.question}
                    </h4>

                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                      {poll.options.length} options • {poll.choice_type === 'single' ? 'Single Choice (1 answer)' : 'Multiple Choice'}
                    </div>

                    <div className="dashboard-poll-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleCopyLink(poll.code)}
                        className="btn btn-secondary-subtle dashboard-poll-btn"
                        style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                      >
                        {copiedCode === poll.code ? 'Copied!' : 'Copy Share Link'}
                      </button>

                      <a
                        href={`/p/${poll.code}/results`}
                        className="btn btn-secondary-subtle dashboard-poll-btn"
                        style={{ fontSize: '0.85rem', padding: '8px 14px', textDecoration: 'none' }}
                      >
                        View Live Results
                      </a>

                      {poll.status === 'draft' && (
                        <button
                          onClick={() => handlePublishDraft(poll.id)}
                          className="btn btn-primary-dominant dashboard-poll-btn"
                          style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                        >
                          Publish Live
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Poll Creation Modal */}
        <CreatePollModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onPollCreated={() => {
            fetchPolls();
          }}
        />
      </div>
  );
}

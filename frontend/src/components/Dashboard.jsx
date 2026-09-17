import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserPolls, publishPoll } from '../services/api';
import { CreatePollModal } from './CreatePollModal';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

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
      <div className="container">
        {/* Creator Header Bar */}
        <div className="dashboard-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--guvi-border)',
        }}>
          <div>
            <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '8px' }}>
              Creator Workspace
            </span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--guvi-dark)' }}>
              Welcome back, {user.name}!
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Signed in as <strong>{user.email}</strong>
            </p>
          </div>

          <div className="dashboard-header-cta" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn btn-primary-dominant"
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}
            >
              Create New Poll
            </button>
          </div>
        </div>

        {/* Account Details & Active Polls Container */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          
          {/* Creator Profile Card */}
          <div className="guvi-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--guvi-dark)', marginBottom: '14px' }}>
              Creator Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--color-text-main)', wordBreak: 'break-word' }}>
              <div>
                <strong style={{ color: 'var(--color-text-muted)' }}>Name:</strong> {user.name}
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted)' }}>Email:</strong> {user.email}
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted)' }}>Account ID:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', wordBreak: 'break-all' }}>{user.id}</code>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted)' }}>Member Since:</strong> {new Date(user.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Poll Management Section */}
          <div className="guvi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--guvi-dark)' }}>
                Active Polls ({polls.length})
              </h3>
            </div>

            {loadingPolls ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading your polls...
              </div>
            ) : polls.length === 0 ? (
              <div style={{
                padding: '28px 16px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: 'var(--radius-sm)',
              }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  You have 0 active polls right now. Launch your first poll to start collecting audience responses live.
                </p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="btn btn-primary-dominant"
                  style={{ fontSize: '0.9rem', padding: '8px 18px' }}
                >
                  Create Your First Poll
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {polls.map((poll) => (
                  <div key={poll.id} style={{
                    border: '1px solid var(--guvi-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <span className={`guvi-badge ${poll.status === 'active' ? 'guvi-badge-green' : 'guvi-badge-blue'}`}>
                        {poll.status === 'active' ? 'Live Poll' : 'Draft Poll'}
                      </span>
                      <code style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--guvi-dark)', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                        Code #{poll.code}
                      </code>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--guvi-dark)', marginBottom: '8px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                      {poll.question}
                    </h4>

                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                      {poll.options.length} options • {poll.choice_type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                    </div>

                    <div className="dashboard-poll-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleCopyLink(poll.code)}
                        className="btn btn-secondary-subtle dashboard-poll-btn"
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        {copiedCode === poll.code ? 'Copied!' : 'Copy Share Link'}
                      </button>

                      <a
                        href={`/p/${poll.code}/results`}
                        className="btn btn-secondary-subtle dashboard-poll-btn"
                        style={{ fontSize: '0.8rem', padding: '6px 12px', textDecoration: 'none' }}
                      >
                        View Live Results
                      </a>

                      {poll.status === 'draft' && (
                        <button
                          onClick={() => handlePublishDraft(poll.id)}
                          className="btn btn-primary-dominant dashboard-poll-btn"
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
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

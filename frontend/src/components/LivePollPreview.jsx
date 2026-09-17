import React, { useState } from 'react';

export function LivePollPreview() {
  const [activeTab, setActiveTab] = useState('vote'); // 'vote' or 'results'
  const [userVoted, setUserVoted] = useState(null);
  
  const [options, setOptions] = useState([
    { id: 1, text: 'React & Modern Frontend Architecture', votes: 42, color: '#0ad652' },
    { id: 2, text: 'Go (Gin) Microservices & High Throughput', votes: 29, color: '#2563eb' },
    { id: 3, text: 'Redis Realtime State & Pub/Sub Fanout', votes: 35, color: '#f97316' },
    { id: 4, text: 'MongoDB Analytics & Scalable Persistence', votes: 18, color: '#8b5cf6' },
  ]);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = (optionId) => {
    if (userVoted === optionId) return;

    setOptions(prev => prev.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votes: opt.votes + 1 };
      }
      if (userVoted && opt.id === userVoted) {
        return { ...opt, votes: opt.votes - 1 };
      }
      return opt;
    }));

    setUserVoted(optionId);
    setActiveTab('results'); // Auto-switch to live results to demonstrate realtime update!
  };

  return (
    <section id="live-demo" style={{ padding: '40px 0 60px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--guvi-dark)' }}>
            Experience Live Polling in Action
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginTop: '6px' }}>
            Cast a test vote below to watch the live progress bars update in real time.
          </p>
        </div>

        <div className="guvi-card" style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0',
          overflow: 'hidden',
          border: '1.5px solid #cbd5e1',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Card Header & PIN Code Display */}
          <div style={{
            backgroundColor: 'var(--guvi-navy)',
            color: '#ffffff',
            padding: '20px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#0ad652', letterSpacing: '0.08em' }}>
                🟢 LIVE POLL • ROOM CODE 849201
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px', color: '#ffffff' }}>
                Which tech stack area are you most excited to master?
              </h3>
            </div>

            {/* Toggle View Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '8px' }}>
              <button
                onClick={() => setActiveTab('vote')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'vote' ? '#ffffff' : 'transparent',
                  color: activeTab === 'vote' ? 'var(--guvi-dark)' : '#cbd5e1',
                  transition: 'all 0.2s ease',
                }}
              >
                Participant View
              </button>
              <button
                onClick={() => setActiveTab('results')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'results' ? '#0ad652' : 'transparent',
                  color: activeTab === 'results' ? '#0d381c' : '#cbd5e1',
                  transition: 'all 0.2s ease',
                }}
              >
                Live Results ({totalVotes})
              </button>
            </div>
          </div>

          {/* Card Body - Content */}
          <div style={{ padding: '28px' }}>
            {activeTab === 'vote' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Select an option below to submit your vote:
                </p>

                {options.map((opt) => {
                  const isSelected = userVoted === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVote(opt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--guvi-green)' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? 'var(--guvi-green-light)' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: isSelected ? '#065f46' : 'var(--color-text-main)',
                      }}
                    >
                      <span>{opt.text}</span>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '6px solid var(--guvi-green)' : '2px solid #cbd5e1',
                        display: 'inline-block',
                      }}></span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {options.map((opt) => {
                  const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const isSelected = userVoted === opt.id;

                  return (
                    <div key={opt.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>
                          {opt.text} {isSelected && <span style={{ color: 'var(--guvi-green)', fontSize: '0.8rem' }}>(Your Vote)</span>}
                        </span>
                        <span>
                          <strong>{opt.votes}</strong> votes ({percentage}%)
                        </span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '14px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: opt.color,
                            borderRadius: '10px',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                <div style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>⚡ <strong>Total Votes Cast:</strong> {totalVotes}</span>
                  <span style={{ color: 'var(--guvi-green)', fontWeight: 700 }}>● Connected & Syncing</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

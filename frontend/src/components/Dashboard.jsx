import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Dashboard({ onCreatePollClick }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div style={{ padding: '48px 0', minHeight: '75vh' }}>
      <div className="container">
        {/* Creator Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--guvi-border)',
        }}>
          <div>
            <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '8px' }}>
              Authenticated Creator Console
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--guvi-dark)' }}>
              Welcome back, {user.name}!
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Signed in as <strong>{user.email}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={onCreatePollClick}
              className="btn btn-primary-dominant"
              style={{ padding: '10px 20px' }}
            >
              + Create New Poll
            </button>
            <button
              onClick={logout}
              className="btn btn-secondary-subtle"
              style={{ padding: '10px 18px' }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Account Details & Active Polls Container */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Creator Profile Card */}
          <div className="guvi-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--guvi-dark)', marginBottom: '16px' }}>
              👤 Creator Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.925rem', color: 'var(--color-text-main)' }}>
              <div>
                <strong style={{ color: 'var(--color-text-muted)' }}>Name:</strong> {user.name}
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted)' }}>Email:</strong> {user.email}
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted)' }}>Account ID:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{user.id}</code>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-muted)' }}>Member Since:</strong> {new Date(user.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Poll Management Placeholder */}
          <div className="guvi-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--guvi-dark)', marginBottom: '16px' }}>
              📊 Active Polls
            </h3>
            <div style={{
              padding: '32px 20px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
                You have 0 active polls right now. Launch your first poll to start collecting audience responses live.
              </p>
              <button
                onClick={onCreatePollClick}
                className="btn btn-primary-dominant"
                style={{ fontSize: '0.9rem', padding: '8px 18px' }}
              >
                Create Your First Poll
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

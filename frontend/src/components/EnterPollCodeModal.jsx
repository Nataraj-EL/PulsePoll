import React, { useState } from 'react';

export function EnterPollCodeModal({ isOpen, onClose, onSubmitCode }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setError('Please enter a poll code.');
      return;
    }
    setError('');
    onSubmitCode(cleanCode);
    setCode('');
    onClose();
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }} onClick={handleClose}>
      <div className="guvi-card" style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '32px 28px',
        position: 'relative',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--guvi-border)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--guvi-dark)', marginBottom: '8px' }}>
            Enter Poll Code
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Enter the 6-digit code provided by the host to join and vote in an active poll.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Enter poll code (e.g. 801388)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={10}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--guvi-border)',
                outline: 'none',
                backgroundColor: '#f8fafc',
                color: 'var(--guvi-dark)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary-subtle"
              style={{ flex: 1, padding: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-dominant"
              style={{ flex: 1.5, padding: '12px' }}
            >
              Join Poll →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

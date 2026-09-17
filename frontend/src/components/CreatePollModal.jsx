import React, { useState } from 'react';
import { createPoll } from '../services/api';

export function CreatePollModal({ isOpen, onClose, onPollCreated }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [choiceType, setChoiceType] = useState('single');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdPoll, setCreatedPoll] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError('Please enter a poll question.');
      return;
    }

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError('Please provide at least 2 non-empty options.');
      return;
    }

    setSubmitting(true);
    const res = await createPoll({
      question: trimmedQuestion,
      options: cleanOptions,
      choiceType,
      publish: true,
    });
    setSubmitting(false);

    if (res.ok && res.data?.poll) {
      setCreatedPoll(res.data.poll);
      if (onPollCreated) onPollCreated(res.data.poll);
    } else {
      const msg = res.data?.message || 'Failed to create poll. Please try again.';
      setError(msg.charAt(0).toUpperCase() + msg.slice(1));
    }
  };

  const shareableUrl = createdPoll
    ? `${window.location.origin}/p/${createdPoll.code}`
    : '';

  const handleCopyLink = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetAndClose = () => {
    setQuestion('');
    setOptions(['', '']);
    setChoiceType('single');
    setError('');
    setCreatedPoll(null);
    setCopied(false);
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
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'clamp(12px, 3vw, 24px)',
    }} onClick={resetAndClose}>
      <div className="guvi-card" style={{
        maxWidth: '540px',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: 'clamp(20px, 4vw, 32px)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }} onClick={(e) => e.stopPropagation()}>

        {createdPoll ? (
          /* SUCCESS VIEW: Shareable Link */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="guvi-badge guvi-badge-green" style={{ marginBottom: '12px' }}>
                Poll Published Live
              </span>
              <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.6rem)', fontWeight: 800, color: 'var(--guvi-dark)' }}>
                Your Poll is Ready to Share!
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', marginTop: '6px' }}>
                Share this link with your audience to start collecting responses.
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--guvi-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 'clamp(14px, 3vw, 20px)',
              marginBottom: '24px',
            }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Poll Question
              </label>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--guvi-dark)', marginBottom: '16px', wordBreak: 'break-word' }}>
                {createdPoll.question}
              </h4>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Shareable Poll Link
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  style={{
                    flex: '1 1 200px',
                    minWidth: 0,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                    color: 'var(--guvi-dark)',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn btn-primary-dominant"
                  style={{ flex: '0 0 auto', padding: '10px 18px', whiteSpace: 'nowrap' }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="btn btn-secondary-subtle"
              style={{ width: '100%', padding: '12px' }}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          /* FORM VIEW: Poll Creation */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', fontWeight: 800, color: 'var(--guvi-dark)' }}>
                  Create a Poll
                </h2>
              </div>
              <button
                onClick={resetAndClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {error && (
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
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                  Poll Question *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Which session topic would you like to cover next?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  Poll Options (2–6 options) *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        required
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.925rem',
                          outline: 'none',
                        }}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#64748b',
                            padding: '0 12px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                          }}
                          title="Remove Option"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    style={{
                      marginTop: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--guvi-green)',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  Choice Type
                </label>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="choiceType"
                      value="single"
                      checked={choiceType === 'single'}
                      onChange={() => setChoiceType('single')}
                    />
                    Single Choice (1 answer)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="choiceType"
                      value="multiple"
                      checked={choiceType === 'multiple'}
                      onChange={() => setChoiceType('multiple')}
                    />
                    Multiple Choice (select any)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary-dominant"
                  style={{ flex: '1 1 180px', padding: '14px', fontSize: '1rem' }}
                >
                  {submitting ? 'Publishing...' : 'Publish Poll & Get Link'}
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="btn btn-secondary-subtle"
                  style={{ flex: '0 1 auto', padding: '14px 20px', fontSize: '1rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { HowItWorks } from './components/HowItWorks';
import { FeatureGrid } from './components/FeatureGrid';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export default function App() {
  const [modalState, setModalState] = useState({ open: false, title: '', message: '' });

  const handleCreatePoll = () => {
    setModalState({
      open: true,
      title: '🚀 Create a New Poll',
      message: 'Poll Creation Studio & Shareable Link Generator is scheduled for full activation in Sprint 2! You will be able to type questions, set 2-6 options, and instantly get your shareable poll link.',
    });
  };

  const handleEnterCode = (code = '') => {
    setModalState({
      open: true,
      title: code ? `📲 Enter Poll Code #${code}` : '📲 Enter Poll Code',
      message: code
        ? `Joining room code #${code}... Mobile participant access without account creation will connect to your live poll session!`
        : 'Enter your 6-digit room PIN code to join an active poll directly from any smartphone.',
    });
  };

  return (
    <>
      <Header
        onCreatePoll={handleCreatePoll}
        onEnterCode={handleEnterCode}
      />
      
      <main style={{ flex: 1 }}>
        <LandingHero
          onCreatePoll={handleCreatePoll}
          onEnterCode={handleEnterCode}
        />
        
        <HowItWorks />
        
        <FeatureGrid />
        
        <FinalCTA
          onCreatePoll={handleCreatePoll}
          onEnterCode={handleEnterCode}
        />
      </main>

      <Footer />

      {/* Modal Dialog */}
      {modalState.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }} onClick={() => setModalState({ open: false, title: '', message: '' })}>
          <div className="guvi-card" style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#ffffff',
            padding: '32px',
            textAlign: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--guvi-dark)', marginBottom: '12px' }}>
              {modalState.title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {modalState.message}
            </p>
            <button
              onClick={() => setModalState({ open: false, title: '', message: '' })}
              className="btn btn-primary-dominant"
              style={{ width: '100%' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { LivePollPreview } from './components/LivePollPreview';
import { HowItWorks } from './components/HowItWorks';
import { FeatureGrid } from './components/FeatureGrid';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export default function App() {
  const [modalState, setModalState] = useState({ open: false, title: '', message: '' });

  const handleCreatePollClick = () => {
    setModalState({
      open: true,
      title: '🚀 Poll Creation Studio',
      message: 'Poll Creation workflow is scheduled for activation in Sprint 2! You can test live response voting right now in the Live Preview section below.',
    });
  };

  const handleJoinPollClick = () => {
    setModalState({
      open: true,
      title: '📲 Join Live Session',
      message: 'Please enter a 6-digit room PIN or try out room #849201 in the interactive preview below!',
    });
  };

  const handleJoinWithPin = (pin) => {
    setModalState({
      open: true,
      title: `📲 Joining Room #${pin}`,
      message: `Connecting to room #${pin}... Live room session joining is ready for Sprint 2 active socket connections! Try out room #849201 in the live interactive demo below.`,
    });
  };

  return (
    <>
      <Header
        onCreatePoll={handleCreatePollClick}
        onJoinPoll={handleJoinPollClick}
      />
      
      <main style={{ flex: 1 }}>
        <LandingHero
          onCreatePoll={handleCreatePollClick}
          onJoinWithPin={handleJoinWithPin}
        />
        
        <LivePollPreview />
        
        <HowItWorks />
        
        <FeatureGrid />
        
        <FinalCTA
          onCreatePoll={handleCreatePollClick}
          onJoinPoll={handleJoinPollClick}
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
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#ffffff',
            padding: '32px',
            textAlign: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--guvi-dark)', marginBottom: '12px' }}>
              {modalState.title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.975rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {modalState.message}
            </p>
            <button
              onClick={() => setModalState({ open: false, title: '', message: '' })}
              className="btn btn-guvi-primary"
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

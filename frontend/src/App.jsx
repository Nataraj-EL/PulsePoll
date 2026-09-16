import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { HowItWorks } from './components/HowItWorks';
import { FeatureGrid } from './components/FeatureGrid';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { SignupPage } from './components/SignupPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'signup' | 'login' | 'dashboard'
  const [modalState, setModalState] = useState({ open: false, title: '', message: '' });

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automatically redirect away from protected dashboard if unauthenticated after loading finishes
  useEffect(() => {
    if (!loading && !user && currentView === 'dashboard') {
      setCurrentView('login');
    }
  }, [loading, user, currentView]);

  const handleCreatePoll = () => {
    if (user) {
      navigateTo('dashboard');
    } else {
      navigateTo('signup');
    }
  };

  const handleEnterCode = (code = '') => {
    setModalState({
      open: true,
      title: code ? `Poll Code #${code}` : 'Enter Poll Code',
      message: code
        ? `Joining poll code #${code}... You can cast votes directly from any smartphone or browser.`
        : 'Enter your 6-digit poll code to join an active poll directly from any smartphone or browser.',
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-indicator" style={{ margin: '0 auto 16px auto', width: '16px', height: '16px' }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Loading PulsePoll...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onCreatePoll={handleCreatePoll}
        onEnterCode={handleEnterCode}
        onNavigate={navigateTo}
      />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'signup' && (
          <SignupPage
            onNavigateToLogin={() => navigateTo('login')}
            onNavigateLogin={() => navigateTo('login')}
            onSignupSuccess={() => navigateTo('dashboard')}
            onSuccess={() => navigateTo('dashboard')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onNavigateToSignup={() => navigateTo('signup')}
            onNavigateSignup={() => navigateTo('signup')}
            onLoginSuccess={() => navigateTo('dashboard')}
            onSuccess={() => navigateTo('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onCreatePollClick={() => {
              setModalState({
                open: true,
                title: 'Create a Poll',
                message: 'Poll builder is ready for backend integration! You are authenticated as a creator.',
              });
            }}
          />
        )}

        {currentView === 'landing' && (
          <>
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
          </>
        )}
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
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


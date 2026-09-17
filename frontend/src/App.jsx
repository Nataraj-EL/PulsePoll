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
import { PollPage } from './components/PollPage';

function parseRoute(pathname) {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  
  if (cleanPath.startsWith('/p/')) {
    const parts = cleanPath.substring(3).split('/');
    const code = parts[0];
    const isResults = parts[1] === 'results';
    if (code) {
      return { view: 'poll', code, isResults };
    }
  }
  
  if (cleanPath === '/login') return { view: 'login', code: '' };
  if (cleanPath === '/signup') return { view: 'signup', code: '' };
  if (cleanPath === '/dashboard') return { view: 'dashboard', code: '' };
  
  return { view: 'landing', code: '' };
}

function getRoutePath(view, code = '', isResults = false) {
  if (view === 'poll' && code) return isResults ? `/p/${code}/results` : `/p/${code}`;
  if (view === 'login') return '/login';
  if (view === 'signup') return '/signup';
  if (view === 'dashboard') return '/dashboard';
  return '/';
}

function AppContent() {
  const { user, loading } = useAuth();
  const [routeState, setRouteState] = useState(() => parseRoute(window.location.pathname));
  const [modalState, setModalState] = useState({ open: false, title: '', message: '' });

  // Listen to browser Back/Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view, code = '') => {
    const targetPath = getRoutePath(view, code);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setRouteState({ view, code });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automatically redirect away from protected dashboard if unauthenticated after loading finishes
  useEffect(() => {
    if (!loading && !user && routeState.view === 'dashboard') {
      navigateTo('login');
    }
  }, [loading, user, routeState.view]);

  const handleCreatePoll = () => {
    if (user) {
      navigateTo('dashboard');
    } else {
      navigateTo('signup');
    }
  };

  const handleEnterCode = (code = '') => {
    if (code) {
      navigateTo('poll', code);
    } else {
      setModalState({
        open: true,
        title: 'Enter Poll Code',
        message: 'Enter your 6-digit poll code in your browser address bar (e.g. /p/801388) to join an active poll directly.',
      });
    }
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
        onEnterCode={() => handleEnterCode('')}
        onNavigate={navigateTo}
      />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Route Match 1: Dynamic Participant Poll View /p/:code */}
        {routeState.view === 'poll' && (
          <PollPage
            key={`${routeState.code}_${routeState.isResults ? 'results' : 'vote'}`}
            pollCode={routeState.code}
            initialTab={routeState.isResults ? 'results' : 'vote'}
            onNavigate={navigateTo}
          />
        )}

        {/* Route Match 2: Signup */}
        {routeState.view === 'signup' && (
          <SignupPage
            onNavigateToLogin={() => navigateTo('login')}
            onNavigateLogin={() => navigateTo('login')}
            onSignupSuccess={() => navigateTo('dashboard')}
            onSuccess={() => navigateTo('dashboard')}
          />
        )}

        {/* Route Match 3: Login */}
        {routeState.view === 'login' && (
          <LoginPage
            onNavigateToSignup={() => navigateTo('signup')}
            onNavigateSignup={() => navigateTo('signup')}
            onLoginSuccess={() => navigateTo('dashboard')}
            onSuccess={() => navigateTo('dashboard')}
          />
        )}

        {/* Route Match 4: Authenticated Creator Dashboard */}
        {routeState.view === 'dashboard' && user && (
          <Dashboard />
        )}

        {/* Route Match 5: Landing Page Fallback */}
        {routeState.view === 'landing' && (
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



import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, signupUser, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check initial authentication state on app load via GET /api/v1/auth/me
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getCurrentUser();
        if (res.ok && res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const signup = async (name, email, password) => {
    setError(null);
    const res = await signupUser({ name, email, password });
    if (res.ok && res.data?.user) {
      setUser({ ...res.data.user, isNewUser: true });
      return { success: true };
    }
    const errorMsg = res.data?.message || 'Failed to create account';
    setError(errorMsg);
    return { success: false, error: errorMsg };
  };

  const login = async (email, password) => {
    setError(null);
    const res = await loginUser({ email, password });
    if (res.ok && res.data?.user) {
      setUser(res.data.user);
      return { success: true };
    }
    const errorMsg = res.data?.message || 'Invalid email address or password';
    setError(errorMsg);
    return { success: false, error: errorMsg };
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signUpBuilder,
  signInBuilder,
  signOutBuilder,
  getCurrentBuilderUser,
  getDiceBearVoxelBotAvatar,
  getSupabaseCredentials,
  setSupabaseCredentials
} from '../utils/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [supabaseConfig, setSupabaseConfigState] = useState(getSupabaseCredentials);
  
  // Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup' | 'config'

  const refreshSupabaseConfig = () => {
    const cfg = getSupabaseCredentials();
    setSupabaseConfigState(cfg);
    return cfg;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionUser = await getCurrentBuilderUser();
        setUser(sessionUser);
      } catch (err) {
        console.error('Failed to initialize builder auth session:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthError('');
    setAuthSuccess('');
    refreshSupabaseConfig();
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError('');
    setAuthSuccess('');
  };

  const saveSupabaseKeys = (url, anonKey) => {
    setSupabaseCredentials(url, anonKey);
    const updated = refreshSupabaseConfig();
    return updated;
  };

  const login = async (email, password) => {
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);
    try {
      const loggedInUser = await signInBuilder({ email, password });
      setUser(loggedInUser);
      closeAuthModal();
      return loggedInUser;
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, username, avatarSeed) => {
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);
    try {
      const newUser = await signUpBuilder({ email, password, username, avatarSeed });
      setUser(newUser);
      if (newUser.confirmed === false) {
        setAuthSuccess('Account created successfully! Please check your email inbox to verify your account.');
      } else {
        closeAuthModal();
      }
      return newUser;
    } catch (err) {
      setAuthError(err.message || 'Failed to sign up.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutBuilder();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        authSuccess,
        setAuthSuccess,
        supabaseConfig,
        saveSupabaseKeys,
        refreshSupabaseConfig,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        getDiceBearVoxelBotAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

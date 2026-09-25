import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mockvue_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('mockvue_token') || null);
  const [loading, setLoading] = useState(false);

  // Background profile sync on boot - NEVER logs out without user's explicit choice
  useEffect(() => {
    const syncProfileInBackground = async () => {
      const storedToken = localStorage.getItem('mockvue_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('mockvue_user', JSON.stringify(res.user));
          }
        } catch (err) {
          // Keep existing session active even if offline or server restarting
          console.warn('[MockVue Auth] Background sync notice:', err.message || err);
        }
      }
    };

    syncProfileInBackground();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('mockvue_token', res.token);
      localStorage.setItem('mockvue_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('mockvue_token', res.token);
      localStorage.setItem('mockvue_user', JSON.stringify(res.user));
    }
    return res;
  };

  // EXPLICIT LOGOUT ONLY: Triggered exclusively when the user manually clicks "Sign Out"
  const logout = () => {
    console.info('[MockVue Auth] User explicitly requested logout.');
    setUser(null);
    setToken(null);
    localStorage.removeItem('mockvue_token');
    localStorage.removeItem('mockvue_user');
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/users/profile', profileData);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('mockvue_user', JSON.stringify(res.user));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        register,
        logout,
        updateProfile,
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

export default AuthContext;

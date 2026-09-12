import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cybertrace_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await authService.getMe(token);
        setUser(me);
      } catch (error) {
        localStorage.removeItem('cybertrace_token');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const login = async (credentials) => {
    const authData = await authService.login(credentials);
    const nextToken = authData.access_token;
    localStorage.setItem('cybertrace_token', nextToken);
    setToken(nextToken);

    const me = await authService.getMe(nextToken);
    setUser(me);
    return me;
  };

  const register = async (payload) => {
    return authService.register(payload);
  };

  const logout = () => {
    localStorage.removeItem('cybertrace_token');
    setToken('');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    setUser
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import api from '../api';
import { User, AuthContextType } from '../types/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // On mount, attempt to load current user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally check expiry with jwt-decode...
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    const me = await api.get('/auth/me');
    setUser(me.data);
    navigate('/');
  };

  const register = async (email: string, password: string) => {
    await api.post('/auth/register', { email, password });
    // optionally auto-login:
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

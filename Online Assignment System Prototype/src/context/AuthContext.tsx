import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

type User = { id: string; name: string; email: string; role: 'student' | 'teacher' } | null;

interface AuthContextValue {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: 'student' | 'teacher' }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext((undefined as unknown) as AuthContextValue | undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('oas_token'));
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem('oas_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('oas_token', token); else localStorage.removeItem('oas_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('oas_user', JSON.stringify(user)); else localStorage.removeItem('oas_user');
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setUser({ id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role as any });
  };

  const register = async (payload: { name: string; email: string; password: string; role: 'student' | 'teacher' }) => {
    await api.register(payload);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

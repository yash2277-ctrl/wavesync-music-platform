import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, clearToken, getToken, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    api<{ user: User }>('/api/auth/me')
      .then(d => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const d = await api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST', auth: false,
      body: JSON.stringify({ email, password }),
    });
    setToken(d.token);
    localStorage.setItem('wavesync-user', JSON.stringify(d.user));
    setUser(d.user);
  };

  const signup = async (email: string, password: string, username: string) => {
    const d = await api<{ token: string; user: User }>('/api/auth/signup', {
      method: 'POST', auth: false,
      body: JSON.stringify({ email, password, username }),
    });
    setToken(d.token);
    localStorage.setItem('wavesync-user', JSON.stringify(d.user));
    setUser(d.user);
  };

  const logout = () => { clearToken(); setUser(null); };

  const refresh = async () => {
    try {
      const d = await api<{ user: User }>('/api/auth/me');
      setUser(d.user);
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

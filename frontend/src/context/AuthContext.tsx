import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '../lib/api';
import { DEMO_STUDENT, DEMO_HR } from '../data/mockData';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (role: 'student' | 'hr') => void;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/api/auth/me', token)
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            const stored = localStorage.getItem('user');
            if (stored) {
              try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('user'); }
            }
          }
        })
        .catch(() => {
          const stored = localStorage.getItem('user');
          if (stored) {
            try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('user'); }
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const loginDemo = useCallback((role: 'student' | 'hr') => {
    const demo = role === 'student' ? DEMO_STUDENT : DEMO_HR;
    const fakeToken = `demo-token-${role}-${Date.now()}`;
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('user', JSON.stringify(demo.user));
    setToken(fakeToken);
    setUser(demo.user);
  }, []);

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await api.post('/api/auth/register', data);
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginDemo, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;

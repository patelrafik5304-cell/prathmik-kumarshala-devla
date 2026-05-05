'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: { username: string; name: string; role: string; class?: string } | null;
  loading: boolean;
  initialized: boolean;
  login: (username: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string; name: string; role: string; class?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setInitialized(true);
  }, []);

  const autoLogin = (userObj: { username: string; name: string; role: string; class?: string }) => {
    setUser(userObj);
    router.push(userObj.role === 'admin' ? '/admin' : userObj.role === 'staff' ? '/staff' : '/student');
  };

  const login = async (username: string, password: string, remember: boolean = true) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Login failed');

    const userObj = { username: data.username, name: data.name || 'Admin', role: data.role, class: data.class || '' };
    setUser(userObj);
    if (remember && data.role !== 'admin') {
      localStorage.setItem('authUser', JSON.stringify(userObj));
    }
    router.push(data.role === 'admin' ? '/admin' : data.role === 'staff' ? '/staff' : '/student');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('rememberedUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, logout, autoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

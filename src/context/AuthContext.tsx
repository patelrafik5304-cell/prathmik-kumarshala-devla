'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: { username: string; name: string; role: string; class?: string } | null;
  login: (username: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string; name: string; role: string; class?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('authUser');
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        if (parsedUser?.role) {
          setUser(parsedUser);
        }
      } catch {}
    }
  }, []);

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
    if (remember) {
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

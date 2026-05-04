'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthUser {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  demoUser: AuthUser | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [demoUser, setDemoUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('demoUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      setDemoUser(parsed);
      setRole(parsed.role);
      setLoading(false);
      return;
    }
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const token = await firebaseUser.getIdTokenResult();
        setRole((token.claims.role as string) || 'student');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) return;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdTokenResult();
    const userRole = (token.claims.role as string) || 'student';
    setRole(userRole);
    if (userRole === 'admin') router.push('/admin');
    else router.push('/student');
  };

  const loginDemo = async (email: string, password: string, selectedRole: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: selectedRole }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Login failed');
    setDemoUser(data.user);
    setRole(data.role);
    localStorage.setItem('demoUser', JSON.stringify(data.user));
    if (data.role === 'admin') router.push('/admin');
    else router.push('/student');
  };

  const logout = async () => {
    localStorage.removeItem('demoUser');
    setDemoUser(null);
    setUser(null);
    setRole(null);
    if (auth) {
      await signOut(auth);
    }
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, demoUser, role, loading, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

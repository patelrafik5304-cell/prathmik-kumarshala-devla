'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'student'>('admin');
  const router = useRouter();
  const { user, demoUser, loginDemo } = useAuth();

  if (user || demoUser) {
    router.push('/admin');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginDemo(username, password, role);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (!auth) throw new Error('Firebase auth not initialized');
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdTokenResult();
      const userRole = (token.claims.role as string) || 'student';
      router.push(userRole === 'admin' ? '/admin' : '/student');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Prathmik Kumarshala</h1>
            <p className="text-sm text-gray-600">Management System</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
                className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <span className="ml-2 text-gray-700">Staff</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === 'student'}
                onChange={() => setRole('student')}
                className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <span className="ml-2 text-gray-700">Student</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              placeholder="Mobile No. / Email / Staff Code"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              placeholder="Password"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="showPassword" className="ml-2 text-sm text-gray-600 cursor-pointer">
              Show Password
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition"
            >
              Forgot Password
            </button>
          </div>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M18.17 8.37H10v3.4h4.56c-.4 1.92-1.92 3.4-4.56 3.4a5.37 5.37 0 1 1 3.44-9.32l2.6-2.6a9.15 9.15 0 1 0 2.13 5.12z" fill="#4285F4"/>
              <path d="M10 18.17a9.15 9.15 0 0 0 6.17-2.27l-2.6-2.6a5.37 5.37 0 0 1-7.14-7.14L3.83 8.76A9.15 9.15 0 0 0 10 18.17z" fill="#34A853"/>
              <path d="M6.43 13.3a5.37 5.37 0 0 1 0-6.6l-2.6-2.54a9.15 9.15 0 0 0 0 11.68z" fill="#FBBC05"/>
              <path d="M10 3.83a5.17 5.17 0 0 1 3.63 1.4l2.74-2.74A9.15 9.15 0 0 0 3.83 6.23l2.6 2.54A5.37 5.37 0 0 1 10 3.83z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
          <p className="font-medium">Demo Credentials:</p>
          <p>Admin: admin / admin123</p>
          <p>Student: student / student123</p>
        </div>
      </div>
    </div>
  );
}

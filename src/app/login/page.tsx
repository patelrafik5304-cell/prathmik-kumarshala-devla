'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'student'>('admin');
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push('/admin');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!auth) throw new Error('Firebase auth not initialized');
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const token = await userCredential.user.getIdTokenResult();
      const userRole = (token.claims.role as string) || 'student';
      router.push(userRole === 'admin' ? '/admin' : '/student');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
          <p>Please use Google Chrome for better experience</p>
          <p className="text-yellow-600 font-medium">
            ⚠ System will be under maintenance everyday between 11:55 PM to 12:30 AM
          </p>
        </div>
      </div>
    </div>
  );
}

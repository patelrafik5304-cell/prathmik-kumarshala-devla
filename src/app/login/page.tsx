'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('rememberedUser');
    if (saved) {
      try {
        const { username: savedUser } = JSON.parse(saved);
        setUsername(savedUser);
        setRemember(true);
      } catch {}
    }
  }, []);

  const validate = () => {
    const errs: { username?: string; password?: string } = {};
    if (!username.trim()) errs.username = 'Username is required';
    if (!password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(username, password, remember);
      if (remember) {
        localStorage.setItem('rememberedUser', JSON.stringify({ username }));
      } else {
        localStorage.removeItem('rememberedUser');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 bg-white/5 rounded-full -top-20 -left-20 animate-float-slow" />
        <div className="absolute w-56 h-56 bg-white/10 rounded-full top-1/3 right-10 animate-float-medium" />
        <div className="absolute w-40 h-40 bg-amber-400/10 rounded-full bottom-10 left-1/4 animate-float-fast" />
        <div className="absolute w-32 h-32 border-2 border-white/10 rounded-lg top-20 right-1/3 animate-spin-slow" />
        <div className="absolute w-24 h-24 border-2 border-white/5 rounded-full bottom-1/4 right-1/4 animate-float-slow" />
        <div className="absolute w-16 h-16 bg-blue-300/10 rounded-lg top-1/2 left-10 animate-float-medium" />
      </div>

      {/* Login Card */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img src="/logo.jpeg" alt="Prathmik Kumarshala" className="w-20 h-20 rounded-2xl shadow-lg mb-4 object-cover transform transition-transform duration-300 hover:scale-105 hover:rotate-2" />
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-amber-500 animate-gradient-text">PRATHMIK KUMARSHALA</h1>
            <p className="text-blue-600 font-medium mt-1">Management System</p>
            <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm animate-slide-in flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setFieldErrors((prev) => ({ ...prev, username: undefined })); }}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none transition-all duration-300 bg-gray-50/50 ${
                    fieldErrors.username
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                  }`}
                  placeholder="Enter your username"
                  required
                />
              </div>
              {fieldErrors.username && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                  className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl outline-none transition-all duration-300 bg-gray-50/50 ${
                    fieldErrors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200 flex items-center justify-center">
                    {remember && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 rounded-xl font-semibold text-base hover:from-amber-600 hover:to-orange-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">Prathmik Kumarshala Devla © 2026</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-15px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-25px) translateX(15px) rotate(10deg); }
          66% { transform: translateY(10px) translateX(-10px) rotate(-5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-40px) scale(1.1); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 9s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes gradient-text {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          background-size: 200% auto;
          animation: gradient-text 4s ease infinite;
        }
      `}</style>
    </div>
  );
}

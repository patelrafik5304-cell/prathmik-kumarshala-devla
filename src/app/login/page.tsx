'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkTablet = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Detect tablet: 768-1024px width AND touch device OR specific tablet user agent
      const isTabletSize = width >= 768 && width <= 1024;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk|Kindle/i.test(navigator.userAgent);
      setIsTablet(isTabletSize && (isTouchDevice || isTabletUA));
    };

    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkTablet, 250);
    };

    // Check once on mount
    checkTablet();

    // Use orientationchange instead of resize for tablets (more stable)
    window.addEventListener('orientationchange', debouncedCheck);

    // Only add resize listener for desktop browsers, not tablets
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      window.addEventListener('resize', debouncedCheck);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('orientationchange', debouncedCheck);
      if (!isTouchDevice) {
        window.removeEventListener('resize', debouncedCheck);
      }
    };
  }, []);

  return isTablet;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const router = useRouter();
  const { login } = useAuth();
  const isTablet = useIsTablet();

  const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTablet) return;
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;top:${y}px;left:${x}px;border-radius:50%;background:rgba(255,255,255,0.4);transform:scale(0);animation:ripple 0.6s linear;pointer-events:none;`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, [isTablet]);

  useEffect(() => {
    const saved = localStorage.getItem('rememberedUser');
    if (saved) {
      try {
        const { username: savedUser } = JSON.parse(saved);
        if (savedUser) setUsername(savedUser);
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
      // Never remember admin logins, only students
      const isAdminLogin = username === '242105010083';
      await login(username, password, !isAdminLogin && remember);
      if (!isAdminLogin && remember) {
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
    <div className={`min-h-screen flex items-center justify-center ${isTablet ? 'bg-blue-800' : 'animated-gradient-bg'} ${isTablet ? 'prevent-flicker' : ''} ${!isTablet ? "bg-[linear-gradient(135deg,#1e3a8a,#1e40af,#1e3a5f,#1e40af)]" : ''}`} style={isTablet ? { backgroundColor: '#1e3a5f' } : { backgroundSize: '400% 400%' }}>
       {/* Login Card */}
       <div className={`relative z-10 w-full max-w-md mx-4 ${isTablet ? '' : 'login-card-entrance'}`}>
           {/* Logo & Title */}
           <div className="text-center mb-8 stagger-children">
             <img src="/logo.jpeg" alt="Prathmik Kumarshala" className={`w-20 h-20 rounded-2xl shadow-lg mb-4 object-cover ${isTablet ? '' : 'logo-breathe'}`} />
             <h1 className={`text-3xl font-bold tracking-tight ${isTablet ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-amber-500 animate-gradient-text'}`}>PRATHMIK KUMARSHALA</h1>
             <p className="text-blue-200 font-medium mt-1">Management System</p>
             <p className="text-gray-300 text-sm mt-2">Sign in to your account</p>
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
              <div className="relative input-icon-focus">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
               <input
                   type="text"
                   value={username}
                   onChange={(e) => { setUsername(e.target.value); setFieldErrors((prev) => ({ ...prev, username: undefined })); }}
                   className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl outline-none ${isTablet ? '' : 'transition-all duration-300 input-focus-glow'} bg-gray-50/50 ${
                     fieldErrors.username
                       ? 'border-red-400 focus:border-red-500'
                       : 'border-gray-200 focus:border-blue-500'
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
              <div className="relative input-icon-focus">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
               <input
                   type={showPassword ? 'text' : 'password'}
                   value={password}
                   onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                   className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl outline-none ${isTablet ? '' : 'transition-all duration-300 input-focus-glow'} bg-gray-50/50 ${
                     fieldErrors.password
                       ? 'border-red-400 focus:border-red-500'
                       : 'border-gray-200 focus:border-blue-500'
                   }`}
                   placeholder="Enter your password"
                   required
                 />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 ${isTablet ? '' : 'eye-toggle-spin'}`}
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
                  <div className={`w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200 flex items-center justify-center ${remember && !isTablet ? 'checkbox-check' : ''}`}>
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
              onClick={handleRipple}
              className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 rounded-xl font-semibold text-base ${isTablet ? '' : 'button-with-sweep hover:from-amber-600 hover:to-orange-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 relative overflow-hidden'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
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
   );
}

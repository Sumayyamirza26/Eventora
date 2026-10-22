import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect straight to admin
  if (api.isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      const msg = 'Please enter both email and password.';
      setError(msg);
      toast.warning(msg);
      return;
    }

    setLoading(true);

    try {
      await api.login({ email: email.trim(), password });
      toast.success('Admin login successful. Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid credentials or login failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@eventora.com');
    setPassword('admin123');
    toast.info('Demo credentials auto-filled!');
  };

  const copyToClipboard = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      toast.success(`Copied ${label} to clipboard!`);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-[#E7E2E9]">
          {/* Header */}
          <div className="bg-[#292331] px-8 py-8 text-center text-white relative">
            <div className="relative mx-auto mb-3 h-14 w-14 overflow-hidden rounded-2xl bg-white/10 p-1.5 shadow-md backdrop-blur">
              <img src="/eventora-icon.png" alt="Eventora" className="h-full w-full object-contain rounded-xl" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
            <p className="mt-1 text-xs text-[#E7E2E9]/80">
              Sign in to manage campus events, seat allocations, and attendee digital passes
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 rounded-xl border border-[#A34235]/30 bg-[#A34235]/10 p-4 text-xs font-medium text-[#A34235]">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Authentication Error
                </div>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold uppercase tracking-wider text-[#625078]">
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  autoComplete="email"
                  required
                  className="input mt-1.5"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-[#625078]">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className="input !pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#625078] hover:text-[#292331] focus:outline-none transition"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying credentials...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </button>
              </div>
            </form>

            {/* Demo Admin Credentials Section */}
            <div className="mt-6 rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-4 text-xs text-[#292331]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 font-bold text-[#292331]">
                  <span className="h-2 w-2 rounded-full bg-[#356548]" />
                  <span>Demo Admin Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D6E59A] px-2.5 py-1 text-[11px] font-bold text-[#292331] shadow-xs hover:bg-[#c9da88] transition"
                  title="Auto-fill login fields"
                >
                  <Zap className="h-3 w-3 fill-current" />
                  <span>Auto-fill</span>
                </button>
              </div>

              <div className="space-y-1.5 font-mono text-[11px] text-[#625078]">
                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-[#E7E2E9]">
                  <span className="truncate">
                    Email: <strong className="text-[#292331] font-sans">admin@eventora.com</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('admin@eventora.com', 'email')}
                    className="ml-2 text-xs text-[#625078] hover:text-[#292331] transition font-sans underline"
                    title="Copy Email"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-[#E7E2E9]">
                  <span>
                    Password: <strong className="text-[#292331] font-sans">admin123</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('admin123', 'password')}
                    className="ml-2 text-xs text-[#625078] hover:text-[#292331] transition font-sans underline"
                    title="Copy Password"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#E7E2E9] pt-5 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#625078] transition hover:text-[#292331]"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Public Events Hub
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#625078]">
          Protected Area &bull; Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}

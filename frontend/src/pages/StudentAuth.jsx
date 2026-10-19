import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { YEARS } from '../utils.js';
import { useToast } from '../components/Toast.jsx';

export default function StudentAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Computer Science',
    year: '1st Year',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!formData.email.trim() || !formData.password) {
        toast.warning('Please enter both email and password');
        return;
      }
    } else {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        toast.warning('Full name must be at least 2 characters');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
        toast.warning('Please enter a valid email address');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        toast.warning('Password must be at least 6 characters');
        return;
      }
      if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
        toast.warning('Phone number must be exactly 10 digits');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        const res = await api.studentLogin({
          email: formData.email,
          password: formData.password,
        });
        toast.success(`Welcome back, ${res.student.name}!`);
      } else {
        const res = await api.studentSignup(formData);
        toast.success(`Account created! Your Student ID is ${res.student.studentId}`);
      }

      const redirectPath = location.state?.from || '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md animate-pop">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#292331] text-white font-black text-xl shadow-md">
            E
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-[#292331]">
            {isLogin ? 'Student Portal Login' : 'Create Student Account'}
          </h1>
          <p className="mt-1 text-xs text-[#625078]">
            {isLogin
              ? 'Access your registered events, digital passes, and certificates'
              : 'Join Eventora to explore campus events and download passes'}
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-6 rounded-3xl border border-[#E7E2E9] bg-white p-6 sm:p-8 shadow-xl">
          {/* Mode Switcher Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-[#F7F5F0] p-1 border border-[#E7E2E9]">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`rounded-xl py-2 text-xs font-bold transition ${
                isLogin
                  ? 'bg-[#292331] text-white shadow-sm'
                  : 'text-[#625078] hover:text-[#292331]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`rounded-xl py-2 text-xs font-bold transition ${
                !isLogin
                  ? 'bg-[#292331] text-white shadow-sm'
                  : 'text-[#625078] hover:text-[#292331]'
              }`}
            >
              Register New
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-[#292331] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="input text-xs"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#292331] mb-1">
                Student Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter student email"
                className="input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292331] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="input text-xs !pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#292331] mb-1">
                    Phone Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#292331] mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Computer Science"
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#292331] mb-1">
                      Year of Study
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="input text-xs"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-[#A34235]/30 bg-[#A34235]/10 p-3 text-xs text-[#A34235] font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 text-xs shadow-md mt-2"
            >
              {submitting
                ? 'Processing...'
                : isLogin
                ? 'Sign In to Student Portal'
                : 'Create Account & Get Student ID'}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { api, studentStorage } from '../api.js';

const linkClass = ({ isActive }) =>
  `rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
    isActive
      ? 'bg-[#292331] text-white shadow-sm'
      : 'text-[#625078] hover:bg-[#F7F5F0] hover:text-[#292331]'
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(api.isAuthenticated());
  const [isStudent, setIsStudent] = useState(studentStorage.isAuthenticated());
  const [student, setStudent] = useState(studentStorage.getStudent());

  // Check auth state whenever location changes
  useEffect(() => {
    setIsAdmin(api.isAuthenticated());
    setIsStudent(studentStorage.isAuthenticated());
    setStudent(studentStorage.getStudent());
  }, [location.pathname]);

  const handleAdminLogout = () => {
    api.logout();
    setIsAdmin(false);
    navigate('/admin/login', { replace: true });
  };

  const handleStudentLogout = () => {
    api.studentLogout();
    setIsStudent(false);
    setStudent(null);
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E7E2E9] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#292331]">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#292331] text-white font-extrabold shadow-sm">
            E
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D6E59A] ring-2 ring-white" />
          </span>
          <span className="text-[#292331]">Eventora</span>
        </NavLink>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <NavLink to="/" end className={linkClass}>
            Events
          </NavLink>

          {/* Student Portal Navigation */}
          {isStudent ? (
            <NavLink to="/dashboard" className={linkClass}>
              <span className="flex items-center gap-1.5">
                <span>🎓 My Dashboard</span>
              </span>
            </NavLink>
          ) : (
            <NavLink to="/student/login" className={linkClass}>
              Student Portal
            </NavLink>
          )}

          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>

          {/* Student Logout */}
          {isStudent && !isAdmin && (
            <button
              onClick={handleStudentLogout}
              className="ml-1 flex items-center gap-1 rounded-xl border border-[#E7E2E9] bg-white px-3 py-1.5 text-xs font-semibold text-[#625078] transition hover:bg-[#A34235]/10 hover:border-[#A34235]/30 hover:text-[#A34235]"
              title="Sign Out Student"
            >
              <span>Exit</span>
            </button>
          )}

          {/* Admin Logout */}
          {isAdmin && (
            <button
              onClick={handleAdminLogout}
              className="ml-1 flex items-center gap-1.5 rounded-xl border border-[#E7E2E9] bg-white px-3 py-1.5 text-xs font-semibold text-[#A34235] transition hover:bg-[#A34235]/10 hover:border-[#A34235]/30"
              title="Sign Out Admin"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Admin from './pages/Admin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import StudentAuth from './pages/StudentAuth.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* Student Portal Routes */}
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/student" element={<Navigate to="/dashboard" replace />} />
          <Route path="/student/login" element={<StudentAuth />} />
          <Route path="/student/signup" element={<StudentAuth />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-[#E7E2E9] bg-white py-6 text-center text-sm text-[#625078]">
        © {new Date().getFullYear()} <span className="font-semibold text-[#292331]">Eventora</span> – College Event Hub
      </footer>
    </div>
  );
}

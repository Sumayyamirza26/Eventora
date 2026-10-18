import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../api.js';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = api.getToken();
      if (!token) {
        if (isMounted) {
          setIsAuthorized(false);
          setVerifying(false);
        }
        return;
      }

      try {
        // Actively verify token signature and validity on the backend
        const res = await api.verifyAuth();
        if (isMounted) {
          if (res?.valid) {
            setIsAuthorized(true);
          } else {
            api.logout();
            setIsAuthorized(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          api.logout();
          setIsAuthorized(false);
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (verifying) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Verifying admin authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}


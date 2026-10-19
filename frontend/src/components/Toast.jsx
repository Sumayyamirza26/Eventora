import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, title, duration = 4000 }) => {
      if (!message) return;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setToasts((prev) => {
        // Prevent duplicate messages if already visible
        const isDuplicate = prev.some((t) => t.message === message && t.type === type);
        if (isDuplicate) return prev;
        return [...prev, { id, type, message, title, duration }];
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
  };

  const getStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bar: 'bg-[#356548]',
          badge: 'bg-[#356548]/15 text-[#356548]',
          border: 'border-[#356548]/30',
          icon: (
            <svg className="h-5 w-5 text-[#356548]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'warning':
        return {
          bar: 'bg-[#875B18]',
          badge: 'bg-[#875B18]/15 text-[#875B18]',
          border: 'border-[#875B18]/30',
          icon: (
            <svg className="h-5 w-5 text-[#875B18]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case 'error':
        return {
          bar: 'bg-[#A34235]',
          badge: 'bg-[#A34235]/15 text-[#A34235]',
          border: 'border-[#A34235]/30',
          icon: (
            <svg className="h-5 w-5 text-[#A34235]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'info':
      default:
        return {
          bar: 'bg-[#485A99]',
          badge: 'bg-[#485A99]/15 text-[#485A99]',
          border: 'border-[#485A99]/30',
          icon: (
            <svg className="h-5 w-5 text-[#485A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast, showToast: addToast }}>
      {children}
      {/* Toast viewport */}
      <div
        className="fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 pointer-events-none sm:px-0"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const style = getStyle(t.type);
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className={`pointer-events-auto flex items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 shadow-lg transition-all animate-pop ${style.border}`}
            >
              <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-xl ${style.badge}`}>
                {style.icon}
              </div>
              <div className="flex-1 text-left">
                {t.title && <p className="text-xs font-bold uppercase tracking-wider text-[#625078]">{t.title}</p>}
                <p className="text-sm font-medium text-[#292331] leading-snug">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                className="grid h-6 w-6 place-items-center rounded-lg text-slate-400 hover:bg-[#F7F5F0] hover:text-[#292331] transition"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}


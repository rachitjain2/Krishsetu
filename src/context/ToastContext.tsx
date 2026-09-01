import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
  dismissToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message, duration: 5500 });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message, duration: 5000 });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        dismissToast,
      }}
    >
      {children}

      {/* Floating High-Readability Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-md w-[calc(100%-2rem)] sm:w-full pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgStyles = 'bg-white border-[#1B4332] text-[#11281E]';
            let iconComponent = <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />;
            let badgeBg = 'bg-emerald-100 text-emerald-800';

            if (toast.type === 'error') {
              bgStyles = 'bg-[#FFF5F5] border-rose-500 text-rose-950';
              iconComponent = <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />;
              badgeBg = 'bg-rose-100 text-rose-800';
            } else if (toast.type === 'warning') {
              bgStyles = 'bg-[#FFFDF0] border-amber-500 text-amber-950';
              iconComponent = <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />;
              badgeBg = 'bg-amber-100 text-amber-800';
            } else if (toast.type === 'info') {
              bgStyles = 'bg-[#F0F7FF] border-blue-500 text-blue-950';
              iconComponent = <Info className="w-6 h-6 text-blue-600 shrink-0" />;
              badgeBg = 'bg-blue-100 text-blue-800';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto p-4 sm:p-5 rounded-[24px] border-2 shadow-xl flex items-start gap-3.5 ${bgStyles}`}
                role="alert"
              >
                <div className="mt-0.5">{iconComponent}</div>
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-black tracking-tight leading-tight">
                      {toast.title}
                    </h4>
                  </div>
                  {toast.message && (
                    <p className="text-xs font-bold opacity-90 leading-relaxed mt-0.5">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="p-2 -mr-1.5 -mt-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-black/5 transition-colors shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

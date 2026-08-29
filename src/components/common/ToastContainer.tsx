import React from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useConsulting();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notification-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-800/80 bg-slate-900 text-slate-100 shadow-2xl',
          error: 'border-rose-800/80 bg-slate-900 text-slate-100 shadow-2xl',
          warning: 'border-amber-800/80 bg-slate-900 text-slate-100 shadow-2xl',
          info: 'border-blue-800/80 bg-slate-900 text-slate-100 shadow-2xl',
        };

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl transition-all transform duration-200 animate-in slide-in-from-bottom-3 ${
              borderStyles[toast.type]
            }`}
          >
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium leading-snug text-slate-200">{toast.message}</p>
            <button
              id={`close-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

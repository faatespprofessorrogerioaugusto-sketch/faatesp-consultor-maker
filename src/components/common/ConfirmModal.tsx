import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="confirm-modal-card"
        className="w-full max-w-md bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full shrink-0 ${
                isDestructive
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                  : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{message}</p>
            </div>
            <button
              id="close-confirm-modal-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              id="cancel-confirm-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              id="submit-confirm-modal-btn"
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm cursor-pointer ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-500 focus:ring-2 focus:ring-rose-500'
                  : 'bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

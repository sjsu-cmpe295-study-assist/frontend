'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'loading' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.type !== 'loading' && toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.type, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[var(--notion-green-text)]" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[var(--notion-red-text)]" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-[var(--notion-blue-text)] animate-spin" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-[var(--notion-green-bg)] border-[var(--notion-green-border)]';
      case 'error':
        return 'bg-[var(--notion-red-bg)] border-[var(--notion-red-border)]';
      case 'loading':
        return 'bg-[var(--notion-blue-bg)] border-[var(--notion-blue-border)]';
      default:
        return 'bg-[var(--notion-gray-bg)] border-[var(--notion-gray-border)]';
    }
  };

  return (
    <div
      className={`${getBgColor()} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[500px] flex items-start gap-3 animate-in slide-in-from-right-full fade-in-0 duration-300`}
    >
      {getIcon()}
      <p className="flex-1 text-sm text-[var(--foreground)]">{toast.message}</p>
      {toast.type !== 'loading' && (
        <button
          onClick={() => onClose(toast.id)}
          className="text-[var(--notion-gray-text)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}


'use client';

import { useState, useCallback } from 'react';
import { Toast, ToastType } from '@/components/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        message,
        type,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    loading: (message: string) => showToast(message, 'loading', 0), // Loading toasts don't auto-dismiss
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
  };

  return { toasts, toast, removeToast };
}


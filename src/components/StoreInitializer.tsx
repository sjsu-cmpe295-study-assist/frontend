'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';

export function StoreInitializer() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    // Initialize theme on mount
    initializeTheme();
    
    // Refresh user on mount
    refreshUser();
  }, [initializeTheme, refreshUser]);

  return null;
}


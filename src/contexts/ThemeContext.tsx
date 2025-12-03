'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const getInitialTheme = (): Theme => {
      if (typeof window === 'undefined') return 'system';
      const stored = localStorage.getItem('theme') as Theme | null;
      return stored || 'system';
    };

    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window === 'undefined') return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    };

    const resolveTheme = (themeValue: Theme): 'light' | 'dark' => {
      if (themeValue === 'system') {
        return getSystemTheme();
      }
      return themeValue;
    };

    // Set initial theme
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    
    const initialResolved = resolveTheme(initialTheme);
    setResolvedTheme(initialResolved);
    setMounted(true);

    // Apply theme class immediately
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (initialResolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window === 'undefined') return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    };

    const resolveTheme = (themeValue: Theme): 'light' | 'dark' => {
      if (themeValue === 'system') {
        return getSystemTheme();
      }
      return themeValue;
    };

    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    // Apply theme class to html element
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        if (newResolved === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    };

    const resolveTheme = (themeValue: Theme): 'light' | 'dark' => {
      if (themeValue === 'system') {
        return getSystemTheme();
      }
      return themeValue;
    };

    const resolved = resolveTheme(newTheme);
    const root = document.documentElement;
    
    // Force remove/add class to ensure it takes effect
    root.classList.remove('dark', 'light');
    
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
    
    // Update state and localStorage
    setThemeState(newTheme);
    setResolvedTheme(resolved);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    if (typeof window === 'undefined') return;
    
    // Check current resolved theme state
    const currentTheme = theme;
    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    };
    
    // Determine what the new theme should be
    let newTheme: Theme;
    if (currentTheme === 'system') {
      // If system, toggle to explicit opposite of current system preference
      newTheme = getSystemTheme() === 'dark' ? 'light' : 'dark';
    } else {
      // If explicit theme, toggle to opposite
      newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    }
    
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


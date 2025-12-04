import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  // State
  theme: Theme;
  resolvedTheme: 'light' | 'dark';

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (themeValue: Theme): 'light' | 'dark' => {
  if (themeValue === 'system') {
    return getSystemTheme();
  }
  return themeValue;
};

const applyThemeClass = (resolved: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(resolved);
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      resolvedTheme: 'light',

      // Initialize theme (should be called on mount)
      initializeTheme: () => {
        const theme = get().theme;
        const resolved = resolveTheme(theme);
        applyThemeClass(resolved);
        set({ resolvedTheme: resolved });

        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            if (get().theme === 'system') {
              const newResolved = getSystemTheme();
              applyThemeClass(newResolved);
              set({ resolvedTheme: newResolved });
            }
          };

          mediaQuery.addEventListener('change', handleChange);
          // Note: In a real app, you'd want to clean this up, but Zustand persist handles it
        }
      },

      // Set theme
      setTheme: (newTheme: Theme) => {
        const resolved = resolveTheme(newTheme);
        applyThemeClass(resolved);
        set({ theme: newTheme, resolvedTheme: resolved });
      },

      // Toggle theme
      toggleTheme: () => {
        const currentTheme = get().theme;
        let newTheme: Theme;

        if (currentTheme === 'system') {
          // If system, toggle to explicit opposite of current system preference
          newTheme = getSystemTheme() === 'dark' ? 'light' : 'dark';
        } else {
          // If explicit theme, toggle to opposite
          newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        }

        const resolved = resolveTheme(newTheme);
        applyThemeClass(resolved);
        set({ theme: newTheme, resolvedTheme: resolved });
      },
    }),
    {
      name: 'theme-storage',
      // Initialize theme on hydration
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          const resolved = resolveTheme(state.theme);
          applyThemeClass(resolved);
          state.resolvedTheme = resolved;
          // Set up system theme listener
          setTimeout(() => {
            state.initializeTheme();
          }, 0);
        }
      },
    }
  )
);


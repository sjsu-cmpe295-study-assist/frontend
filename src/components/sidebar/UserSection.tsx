import { Moon, Sun, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

export function UserSection() {
  const { user, logout } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-3 border-t border-[var(--notion-gray-border)]">
      {/* Actions */}
      <div className="space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-2 py-0.5 rounded-md text-base font-medium text-[var(--notion-gray-text)] hover:bg-[var(--notion-gray-bg-hover)] hover:text-[var(--foreground)] transition-colors"
          aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Moon
              className={`w-5 h-5 absolute transition-all duration-200 ${
                resolvedTheme === 'light'
                  ? 'opacity-100 rotate-0 scale-100'
                  : 'opacity-0 rotate-90 scale-0'
              }`}
            />
            <Sun
              className={`w-5 h-5 absolute transition-all duration-200 ${
                resolvedTheme === 'dark'
                  ? 'opacity-100 rotate-0 scale-100'
                  : 'opacity-0 -rotate-90 scale-0'
              }`}
            />
          </div>
          <div className="min-w-0">
            <span className="transition-opacity duration-200 text-base font-medium text-[var(--notion-gray-text)]">
              {resolvedTheme === 'light' ? 'Dark mode' : 'Light mode'}
            </span>
          </div>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-2 py-0.5 rounded-md text-base font-medium text-[var(--notion-red-text)] hover:bg-[var(--notion-red-bg)] hover:text-[var(--notion-red-text)] transition-colors"
          aria-label="Sign out"
        >
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span>Sign out</span>
          </div>
        </button>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--notion-gray-bg-hover)] transition-colors cursor-pointer group">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--notion-gray-bg)] flex items-center justify-center text-sm font-semibold text-[var(--foreground)] flex-shrink-0">
          {user?.name ? getInitials(user.name) : 'U'}
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-[var(--foreground)] truncate">
            {user?.name || 'User'}
          </p>
          <p className="text-sm text-[var(--notion-gray-text)] truncate">
            {user?.email || ''}
          </p>
        </div>
      </div>
    </div>
  );
}


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '@/lib/api/auth';
import type { UserResponse, SignupData, LoginData } from '@/lib/api/auth';

interface AuthStore {
  // State
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  signup: (data: SignupData) => Promise<UserResponse>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: true, // Start as true to prevent premature redirects
      error: null,

      // Sign up a new user
      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          const userData = await authApi.signup(data);
          set({ user: userData, isLoading: false });
          return userData;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Login user
      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.login(data);
          // Get user data after successful login
          const userData = await authApi.getCurrentUser();
          set({ user: userData, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to login';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Logout user
      logout: () => {
        authApi.logout();
        set({ user: null, error: null, isLoading: false });
      },

      // Refresh current user data
      refreshUser: async () => {
        // Only set loading if we don't have a user yet (to avoid flicker)
        const currentUser = get().user;
        if (!currentUser) {
          set({ isLoading: true });
        }
        
        try {
          const token = authApi.getAuthToken();
          if (token) {
            try {
              const userData = await authApi.getCurrentUser();
              set({ user: userData, isLoading: false });
            } catch (error: any) {
              // Only clear user if it's an auth error (401/403), not network errors
              if (error?.status === 401 || error?.status === 403) {
                // Token is invalid, clear everything
                authApi.logout();
                set({ user: null, isLoading: false });
              } else {
                // Network or other error - keep existing user if we have one
                set({ isLoading: false });
              }
            }
          } else {
            // No token - clear user
            set({ user: null, isLoading: false });
          }
        } catch (error) {
          // Unexpected error - only clear if we don't have a persisted user
          const currentUser = get().user;
          if (!currentUser) {
            set({ user: null, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user, not loading/error states
      onRehydrateStorage: () => (state) => {
        // When rehydrating, set isLoading based on whether we have a user and token
        if (state) {
          const token = authApi.getAuthToken();
          if (state.user && token) {
            // We have both user and token, but need to verify
            state.isLoading = true;
          } else if (!token) {
            // No token, clear user
            state.user = null;
            state.isLoading = false;
          } else {
            // Token but no user - need to fetch
            state.isLoading = true;
          }
        }
      },
    }
  )
);

// Computed selector for isAuthenticated
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);


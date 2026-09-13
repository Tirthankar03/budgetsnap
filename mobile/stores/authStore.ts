import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storage } from '../utils/storage';
import { setToken, setLogoutFn } from '../services/tokenHolder';
import api from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
  logout: () => void;
  setOnboardingComplete: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      isInitialized: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          setToken(data.token);
          let hasBudget = false;
          try {
            const budgetResponse = await api.get('/budgets/current');
            hasBudget = Boolean(budgetResponse.data);
          } catch {}
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            hasCompletedOnboarding: hasBudget,
            isInitialized: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.error || 'Login failed');
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          setToken(data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.error || 'Registration failed');
        }
      },

      initializeAuth: async () => {
        const { token, isAuthenticated } = get();
        if (!token || !isAuthenticated) {
          set({ isInitialized: true });
          return;
        }

        try {
          const { data } = await api.get('/budgets/current');
          set({ hasCompletedOnboarding: Boolean(data) });
        } catch {
          set({ hasCompletedOnboarding: false });
        } finally {
          set({ isInitialized: true });
        }
      },

      logout: () => {
        setToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          isInitialized: true,
        });
      },

      setOnboardingComplete: () => {
        set({ hasCompletedOnboarding: true });
      },

      updateProfile: async (data) => {
        const { data: updated } = await api.put('/auth/profile', data);
        set({ user: updated });
      },

      deleteAccount: async () => {
        await api.delete('/auth/account');
        get().logout();
      },
    }),
    {
      name: 'budgetsnap-auth',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync persisted token to the token holder on app start
        if (state?.token) {
          setToken(state.token);
        }
        void useAuthStore.getState().initializeAuth();
      },
    }
  )
);

// Register the logout function so the API interceptor can call it
setLogoutFn(() => useAuthStore.getState().logout());

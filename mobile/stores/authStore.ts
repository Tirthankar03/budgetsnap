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

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          setToken(data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
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
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.error || 'Registration failed');
        }
      },

      logout: () => {
        setToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
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
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync persisted token to the token holder on app start
        if (state?.token) {
          setToken(state.token);
        }
      },
    }
  )
);

// Register the logout function so the API interceptor can call it
setLogoutFn(() => useAuthStore.getState().logout());

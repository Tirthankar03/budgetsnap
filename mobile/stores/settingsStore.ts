import { create } from 'zustand';
import api from '../services/api';
import type { UserSettings } from '../types';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;

  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: null,
  isLoading: false,

  fetchSettings: async () => {
    try {
      const { data } = await api.get('/settings');
      set({ settings: data });
    } catch (err) {
      // ignore
    }
  },

  updateSettings: async (updates) => {
    const { data } = await api.put('/settings', updates);
    set({ settings: data });
  },
}));

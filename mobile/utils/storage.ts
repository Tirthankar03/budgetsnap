import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// In-memory fallback if both localStorage and AsyncStorage are unavailable
const memoryStore = new Map<string, string>();

let nativeStorage: any = null;

if (Platform.OS !== 'web') {
  try {
    nativeStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    console.warn('[storage] AsyncStorage not available, using in-memory fallback');
  }
}

export const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(name);
      }
      if (nativeStorage) {
        return await nativeStorage.getItem(name);
      }
      return memoryStore.get(name) ?? null;
    } catch (e) {
      console.warn('[storage] getItem failed, using memory fallback:', e);
      return memoryStore.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(name, value);
        return;
      }
      if (nativeStorage) {
        await nativeStorage.setItem(name, value);
        return;
      }
      memoryStore.set(name, value);
    } catch (e) {
      console.warn('[storage] setItem failed, using memory fallback:', e);
      memoryStore.set(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(name);
        return;
      }
      if (nativeStorage) {
        await nativeStorage.removeItem(name);
        return;
      }
      memoryStore.delete(name);
    } catch (e) {
      console.warn('[storage] removeItem failed, using memory fallback:', e);
      memoryStore.delete(name);
    }
  },
};

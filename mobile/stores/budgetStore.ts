import { create } from 'zustand';
import api from '../services/api';
import type { Budget, CategoryInput } from '../types';

interface BudgetState {
  currentBudget: Budget | null;
  isLoading: boolean;
  error: string | null;

  fetchCurrentBudget: () => Promise<void>;
  createBudget: (data: {
    month: number;
    year: number;
    totalAmount: number;
    categories: CategoryInput[];
  }) => Promise<Budget>;
  refreshBudget: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
  currentBudget: null,
  isLoading: false,
  error: null,

  fetchCurrentBudget: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/budgets/current');
      set({ currentBudget: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createBudget: async (budgetData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/budgets', budgetData);
      set({ currentBudget: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, isLoading: false });
      throw err;
    }
  },

  refreshBudget: async () => {
    await get().fetchCurrentBudget();
  },
}));

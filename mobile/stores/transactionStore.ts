import { create } from 'zustand';
import api from '../services/api';
import type { Transaction, CreateTransactionInput } from '../types';

interface TransactionState {
  recentTransactions: Transaction[];
  monthTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  fetchRecent: (limit?: number) => Promise<void>;
  fetchMonth: (month: number, year: number) => Promise<void>;
  createTransaction: (data: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<CreateTransactionInput>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>()((set) => ({
  recentTransactions: [],
  monthTransactions: [],
  isLoading: false,
  error: null,

  fetchRecent: async (limit = 5) => {
    try {
      const { data } = await api.get(`/transactions/recent?limit=${limit}`);
      set({ recentTransactions: data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchMonth: async (month, year) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/transactions/month/${month}/${year}`);
      set({ monthTransactions: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createTransaction: async (txnData) => {
    const { data } = await api.post('/transactions', txnData);
    return data;
  },

  updateTransaction: async (id, txnData) => {
    const { data } = await api.put(`/transactions/${id}`, txnData);
    return data;
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}`);
  },
}));

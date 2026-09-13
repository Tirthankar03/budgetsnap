import { create } from 'zustand';
import api from '../services/api';
import type { Draft } from '../types';

interface DraftState {
  drafts: Draft[];
  draftCount: number;
  isLoading: boolean;

  fetchDrafts: () => Promise<void>;
  createDraft: (data: any) => Promise<Draft>;
  resolveDraft: (draftId: string, transactionData: any) => Promise<any>;
  deleteDraft: (draftId: string) => Promise<void>;
}

export const useDraftStore = create<DraftState>()((set) => ({
  drafts: [],
  draftCount: 0,
  isLoading: false,

  fetchDrafts: async () => {
    try {
      const { data } = await api.get('/drafts');
      set({ drafts: data, draftCount: data.length });
    } catch (err) {
      // Silently fail
    }
  },

  createDraft: async (draftData) => {
    const { data } = await api.post('/drafts', draftData);
    set((state) => ({
      drafts: [data, ...state.drafts],
      draftCount: state.draftCount + 1,
    }));
    return data;
  },

  resolveDraft: async (draftId, transactionData) => {
    const { data } = await api.post(`/drafts/${draftId}/resolve`, transactionData);
    set((state) => ({
      drafts: state.drafts.filter((d) => d.id !== draftId),
      draftCount: Math.max(0, state.draftCount - 1),
    }));
    return data;
  },

  deleteDraft: async (draftId) => {
    await api.delete(`/drafts/${draftId}`);
    set((state) => ({
      drafts: state.drafts.filter((d) => d.id !== draftId),
      draftCount: Math.max(0, state.draftCount - 1),
    }));
  },
}));

import { create } from 'zustand';

export interface Participant {
  label: string;
  share: number;
  isYou: boolean;
  customValue: string; // user input for amount/fraction/percentage
}

export type SplitMethod = 'evenly' | 'amount' | 'fraction' | 'percentage';

interface SplitState {
  isActive: boolean;
  method: SplitMethod;
  totalAmount: number;
  totalPeople: number;
  participants: Participant[];
  yourShare: number;

  activate: (amount: number) => void;
  deactivate: () => void;
  setMethod: (method: SplitMethod) => void;
  setTotalAmount: (amount: number) => void;
  setTotalPeople: (count: number) => void;
  updateParticipantValue: (index: number, value: string) => void;
  recalculate: () => void;
  getSplitPayload: () => any;
}

function buildParticipants(count: number, old: Participant[]): Participant[] {
  return Array.from({ length: count }, (_, i) => ({
    label: i === 0 ? 'You' : (old[i]?.label || `P${i}`),
    share: 0,
    isYou: i === 0,
    customValue: old[i]?.customValue || '',
  }));
}

export const useSplitStore = create<SplitState>()((set, get) => ({
  isActive: false,
  method: 'evenly',
  totalAmount: 0,
  totalPeople: 3,
  participants: buildParticipants(3, []),
  yourShare: 0,

  activate: (amount) => {
    const count = get().totalPeople;
    const share = Math.round((amount / count) * 100) / 100;
    set({
      isActive: true,
      totalAmount: amount,
      method: 'evenly',
      participants: buildParticipants(count, []).map(p => ({ ...p, share })),
      yourShare: share,
    });
  },

  deactivate: () => {
    set({
      isActive: false,
      method: 'evenly',
      totalAmount: 0,
      totalPeople: 3,
      participants: buildParticipants(3, []),
      yourShare: 0,
    });
  },

  setMethod: (method) => {
    set({ method });
    // Reset custom values when switching methods
    set((s) => ({
      participants: s.participants.map(p => ({ ...p, customValue: '' })),
    }));
    get().recalculate();
  },

  setTotalAmount: (amount) => {
    set({ totalAmount: amount });
    get().recalculate();
  },

  setTotalPeople: (count) => {
    const old = get().participants;
    set({ totalPeople: count, participants: buildParticipants(count, old) });
    get().recalculate();
  },

  updateParticipantValue: (index, value) => {
    set((s) => ({
      participants: s.participants.map((p, i) =>
        i === index ? { ...p, customValue: value } : p
      ),
    }));
    get().recalculate();
  },

  recalculate: () => {
    const { method, totalAmount, totalPeople, participants } = get();

    let updated: Participant[];

    switch (method) {
      case 'evenly': {
        const share = totalAmount > 0 ? Math.round((totalAmount / totalPeople) * 100) / 100 : 0;
        updated = participants.map(p => ({ ...p, share }));
        break;
      }

      case 'amount': {
        // Each participant's customValue is their exact share in INR
        updated = participants.map(p => {
          const val = parseFloat(p.customValue) || 0;
          return { ...p, share: val };
        });
        break;
      }

      case 'fraction': {
        // customValue is like "1", "2", "1.5" — relative weights
        const weights = participants.map(p => parseFloat(p.customValue) || 1);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        updated = participants.map((p, i) => ({
          ...p,
          share: totalWeight > 0 ? Math.round((weights[i] / totalWeight) * totalAmount * 100) / 100 : 0,
        }));
        break;
      }

      case 'percentage': {
        // customValue is a percentage like "30", "40", "30"
        updated = participants.map(p => {
          const pct = parseFloat(p.customValue) || 0;
          return { ...p, share: Math.round((pct / 100) * totalAmount * 100) / 100 };
        });
        break;
      }

      default:
        updated = participants;
    }

    const yourShare = updated.find(p => p.isYou)?.share ?? 0;
    set({ participants: updated, yourShare });
  },

  getSplitPayload: () => {
    const { method, totalPeople, participants } = get();
    return {
      splitMethod: method,
      totalPeople,
      participants: participants.map(p => ({
        label: p.label,
        share: p.share,
        isYou: p.isYou,
      })),
    };
  },
}));

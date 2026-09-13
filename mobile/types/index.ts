export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  sortOrder: number;
}

export interface Budget {
  id: string;
  month: number;
  year: number;
  totalAmount: number;
  totalSpent: number;
  remainingBudget: number;
  categories: Category[];
}

export interface SplitParticipant {
  id?: string;
  label: string;
  share: number;
  isYou: boolean;
}

export interface Split {
  id?: string;
  splitMethod: 'evenly' | 'amount' | 'fraction' | 'percentage';
  totalPeople: number;
  participants: SplitParticipant[];
}

export interface Transaction {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  yourShare: number;
  note: string | null;
  merchant: string | null;
  paymentMethod: string;
  transactionDate: string;
  source: 'manual' | 'ocr';
  split: Split | null;
  createdAt: string;
}

export interface Draft {
  id: string;
  amount: number | null;
  merchant: string | null;
  transactionDate: string | null;
  paymentMethod: string | null;
  rawOcrText: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface UserSettings {
  userId: string;
  draftMode: boolean;
  notifCategoryLimit: boolean;
  notifDailySummary: boolean;
  notifDailySummaryTime: string;
  notifMonthlyReset: boolean;
}

export interface ArchiveStats {
  monthsCount: number;
  avgUsedPercent: number;
  bestMonth: string | null;
  monthlyTrend: Array<{
    month: string;
    monthNum: number;
    year: number;
    spent: number;
    budget: number;
    usedPercent: number;
  }>;
  budgetsList: Budget[];
}

export interface CategoryInput {
  name: string;
  icon: string;
  color: string;
  allocatedAmount: number;
  sortOrder?: number;
}

export interface CreateTransactionInput {
  categoryId: string;
  amount: number;
  yourShare?: number;
  note?: string;
  merchant?: string;
  paymentMethod?: string;
  transactionDate: string;
  source?: 'manual' | 'ocr';
  split?: {
    splitMethod: 'evenly' | 'amount' | 'fraction' | 'percentage';
    totalPeople: number;
    participants: Array<{ label: string; share: number; isYou: boolean }>;
  };
}

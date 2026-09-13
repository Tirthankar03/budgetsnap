import { z } from 'zod';

export const categoryInputSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  allocatedAmount: z.number().positive(),
  sortOrder: z.number().optional().default(0),
});

export const createBudgetSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  totalAmount: z.number().positive(),
  categories: z.array(categoryInputSchema).min(1).max(10, 'Maximum 10 categories allowed per budget'),
});

export const updateCategoryAllocationsSchema = z.object({
  categories: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    icon: z.string().min(1),
    color: z.string().min(1),
    allocatedAmount: z.number().positive(),
    sortOrder: z.number().optional().default(0),
  })).min(1).max(10),
});

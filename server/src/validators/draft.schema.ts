import { z } from 'zod';

export const createDraftSchema = z.object({
  amount: z.number().optional(),
  merchant: z.string().optional(),
  transactionDate: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : undefined),
  paymentMethod: z.string().optional().default('UPI'),
  rawOcrText: z.string().optional(),
});

export const resolveDraftSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  yourShare: z.number().positive().optional(),
  note: z.string().optional(),
  merchant: z.string().optional(),
  paymentMethod: z.string().optional().default('UPI'),
  transactionDate: z.string().or(z.date()).transform((val) => new Date(val)),
  split: z.object({
    splitMethod: z.enum(['evenly', 'amount', 'fraction', 'percentage']),
    totalPeople: z.number().min(2).max(10),
    participants: z.array(z.object({
      label: z.string().min(1),
      share: z.number().nonnegative(),
      isYou: z.boolean().optional().default(false),
    })).min(2),
  }).optional(),
});

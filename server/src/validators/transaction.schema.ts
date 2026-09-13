import { z } from 'zod';

export const splitParticipantSchema = z.object({
  label: z.string().min(1),
  share: z.number().nonnegative(),
  isYou: z.boolean().optional().default(false),
});

export const splitInputSchema = z.object({
  splitMethod: z.enum(['evenly', 'amount', 'fraction', 'percentage']),
  totalPeople: z.number().min(2).max(10),
  participants: z.array(splitParticipantSchema).min(2),
});

export const createTransactionSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  yourShare: z.number().positive().optional(),
  note: z.string().optional(),
  merchant: z.string().optional(),
  paymentMethod: z.string().optional().default('UPI'),
  transactionDate: z.string().or(z.date()).transform((val) => new Date(val)),
  source: z.enum(['manual', 'ocr']).optional().default('manual'),
  split: splitInputSchema.optional(),
});

import { eq, and, gt } from 'drizzle-orm';
import { db } from '../config/database.js';
import { drafts } from '../db/schema.js';
import { createTransaction } from './transaction.service.js';

export async function createDraft(userId: string, data: {
  amount?: number;
  merchant?: string;
  transactionDate?: Date;
  paymentMethod?: string;
  rawOcrText?: string;
}) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const [newDraft] = await db.insert(drafts).values({
    userId,
    amount: data.amount ? data.amount.toString() : null,
    merchant: data.merchant || null,
    transactionDate: data.transactionDate || now,
    paymentMethod: data.paymentMethod || 'UPI',
    rawOcrText: data.rawOcrText || null,
    createdAt: now,
    expiresAt,
  }).returning();

  return {
    id: newDraft.id,
    amount: newDraft.amount ? parseFloat(newDraft.amount) : null,
    merchant: newDraft.merchant,
    transactionDate: newDraft.transactionDate,
    paymentMethod: newDraft.paymentMethod,
    rawOcrText: newDraft.rawOcrText,
    createdAt: newDraft.createdAt,
    expiresAt: newDraft.expiresAt,
  };
}

export async function getActiveDrafts(userId: string) {
  const now = new Date();
  const activeDrafts = await db.select().from(drafts).where(
    and(
      eq(drafts.userId, userId),
      gt(drafts.expiresAt, now)
    )
  );

  return activeDrafts.map(d => ({
    id: d.id,
    amount: d.amount ? parseFloat(d.amount) : null,
    merchant: d.merchant,
    transactionDate: d.transactionDate,
    paymentMethod: d.paymentMethod,
    rawOcrText: d.rawOcrText,
    createdAt: d.createdAt,
    expiresAt: d.expiresAt,
  }));
}

export async function resolveDraft(userId: string, draftId: string, transactionData: any) {
  // Verify draft exists and belongs to user
  const [draft] = await db.select().from(drafts).where(
    and(eq(drafts.id, draftId), eq(drafts.userId, userId))
  ).limit(1);

  if (!draft) throw new Error('Draft not found');

  // Delete the draft
  await db.delete(drafts).where(eq(drafts.id, draftId));

  // Create transaction with source = 'ocr'
  return createTransaction(userId, { ...transactionData, source: 'ocr' });
}

export async function deleteDraft(userId: string, draftId: string) {
  await db.delete(drafts).where(
    and(eq(drafts.id, draftId), eq(drafts.userId, userId))
  );
  return { success: true };
}

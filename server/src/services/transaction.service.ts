import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from '../config/database.js';
import { transactions, splits, splitParticipants, categories } from '../db/schema.js';

export async function createTransaction(userId: string, data: {
  categoryId: string;
  amount: number;
  yourShare?: number;
  note?: string;
  merchant?: string;
  paymentMethod?: string;
  transactionDate: Date;
  source?: string;
  split?: {
    splitMethod: string;
    totalPeople: number;
    participants: Array<{ label: string; share: number; isYou?: boolean }>;
  };
}) {
  const yourShare = data.yourShare ?? (
    data.split
      ? (data.split.participants.find(p => p.isYou)?.share ?? data.amount / data.split.totalPeople)
      : data.amount
  );

  const [newTxn] = await db.insert(transactions).values({
    userId,
    categoryId: data.categoryId,
    amount: data.amount.toString(),
    yourShare: yourShare.toString(),
    note: data.note || null,
    merchant: data.merchant || null,
    paymentMethod: data.paymentMethod || 'UPI',
    transactionDate: data.transactionDate,
    source: data.source || 'manual',
  }).returning();

  if (data.split) {
    const [newSplit] = await db.insert(splits).values({
      transactionId: newTxn.id,
      splitMethod: data.split.splitMethod,
      totalPeople: data.split.totalPeople,
    }).returning();

    const participantValues = data.split.participants.map(p => ({
      splitId: newSplit.id,
      label: p.label,
      share: p.share.toString(),
      isYou: p.isYou || false,
    }));

    await db.insert(splitParticipants).values(participantValues);
  }

  return getTransactionById(userId, newTxn.id);
}

export async function updateTransaction(userId: string, transactionId: string, data: {
  categoryId?: string;
  amount?: number;
  yourShare?: number;
  note?: string;
  merchant?: string;
  paymentMethod?: string;
  transactionDate?: Date;
}) {
  // Verify ownership
  const [existing] = await db.select().from(transactions).where(
    and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
  ).limit(1);

  if (!existing) throw new Error('Transaction not found');

  const updates: Record<string, any> = {};
  if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
  if (data.amount !== undefined) updates.amount = data.amount.toString();
  if (data.yourShare !== undefined) updates.yourShare = data.yourShare.toString();
  if (data.note !== undefined) updates.note = data.note || null;
  if (data.merchant !== undefined) updates.merchant = data.merchant || null;
  if (data.paymentMethod !== undefined) updates.paymentMethod = data.paymentMethod;
  if (data.transactionDate !== undefined) updates.transactionDate = data.transactionDate;

  // If amount changed but yourShare not explicitly set, and no split exists, yourShare = amount
  if (data.amount !== undefined && data.yourShare === undefined) {
    const [existingSplit] = await db.select().from(splits).where(eq(splits.transactionId, transactionId)).limit(1);
    if (!existingSplit) {
      updates.yourShare = data.amount.toString();
    }
  }

  await db.update(transactions).set(updates).where(eq(transactions.id, transactionId));
  return getTransactionById(userId, transactionId);
}

export async function getTransactionById(userId: string, transactionId: string) {
  const [txn] = await db.select().from(transactions).where(
    and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
  ).limit(1);

  if (!txn) return null;

  const [cat] = await db.select().from(categories).where(eq(categories.id, txn.categoryId)).limit(1);

  let splitData = null;
  const [split] = await db.select().from(splits).where(eq(splits.transactionId, txn.id)).limit(1);
  if (split) {
    const participants = await db.select().from(splitParticipants).where(eq(splitParticipants.splitId, split.id));
    splitData = {
      id: split.id,
      splitMethod: split.splitMethod,
      totalPeople: split.totalPeople,
      participants: participants.map(p => ({
        id: p.id,
        label: p.label,
        share: parseFloat(p.share),
        isYou: p.isYou,
      })),
    };
  }

  return {
    id: txn.id,
    categoryId: txn.categoryId,
    categoryName: cat?.name || 'Unknown',
    categoryIcon: cat?.icon || 'help-circle',
    categoryColor: cat?.color || '#00E676',
    amount: parseFloat(txn.amount),
    yourShare: parseFloat(txn.yourShare),
    note: txn.note,
    merchant: txn.merchant,
    paymentMethod: txn.paymentMethod,
    transactionDate: txn.transactionDate,
    source: txn.source,
    split: splitData,
    createdAt: txn.createdAt,
  };
}

export async function getRecentTransactions(userId: string, limit: number = 5) {
  const rawTxns = await db.select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.transactionDate))
    .limit(limit);

  return Promise.all(rawTxns.map(t => getTransactionById(userId, t.id)));
}

export async function getMonthTransactions(userId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const rawTxns = await db.select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate)
      )
    )
    .orderBy(desc(transactions.transactionDate));

  return Promise.all(rawTxns.map(t => getTransactionById(userId, t.id)));
}

export async function deleteTransaction(userId: string, transactionId: string) {
  await db.delete(transactions).where(
    and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
  );
  return { success: true };
}

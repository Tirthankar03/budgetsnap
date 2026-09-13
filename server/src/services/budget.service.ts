import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { budgets, categories, transactions } from '../db/schema.js';

export async function createOrUpdateBudget(userId: string, data: {
  month: number;
  year: number;
  totalAmount: number;
  categories: Array<{ name: string; icon: string; color: string; allocatedAmount: number; sortOrder?: number }>;
}) {
  const existing = await db.select().from(budgets).where(
    and(
      eq(budgets.userId, userId),
      eq(budgets.month, data.month),
      eq(budgets.year, data.year)
    )
  ).limit(1);

  let budgetId: string;

  if (existing.length > 0) {
    budgetId = existing[0].id;
    await db.update(budgets).set({
      totalAmount: data.totalAmount.toString(),
      updatedAt: new Date(),
    }).where(eq(budgets.id, budgetId));

    // Delete existing categories and re-create
    await db.delete(categories).where(eq(categories.budgetId, budgetId));
  } else {
    const [newBudget] = await db.insert(budgets).values({
      userId,
      month: data.month,
      year: data.year,
      totalAmount: data.totalAmount.toString(),
    }).returning();
    budgetId = newBudget.id;
  }

  // Insert categories
  const categoryValues = data.categories.map((c, index) => ({
    budgetId,
    name: c.name,
    icon: c.icon,
    color: c.color,
    allocatedAmount: c.allocatedAmount.toString(),
    sortOrder: c.sortOrder ?? index,
  }));

  await db.insert(categories).values(categoryValues).returning();
  return getBudgetWithStats(userId, data.month, data.year);
}

export async function getBudgetWithStats(userId: string, month: number, year: number) {
  const [budget] = await db.select().from(budgets).where(
    and(
      eq(budgets.userId, userId),
      eq(budgets.month, month),
      eq(budgets.year, year)
    )
  ).limit(1);

  if (!budget) return null;

  const budgetCategories = await db.select().from(categories).where(eq(categories.budgetId, budget.id));

  // Calculate spent per category
  const categoriesWithSpent = await Promise.all(
    budgetCategories.map(async (cat) => {
      const [spentResult] = await db.select({
        totalSpent: sql<string>`COALESCE(SUM(${transactions.yourShare}), 0)`
      }).from(transactions).where(eq(transactions.categoryId, cat.id));

      const spent = parseFloat(spentResult?.totalSpent || '0');
      const allocated = parseFloat(cat.allocatedAmount);
      const remaining = allocated - spent;

      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        allocatedAmount: allocated,
        spentAmount: spent,
        remainingAmount: remaining,
        sortOrder: cat.sortOrder,
      };
    })
  );

  const totalSpent = categoriesWithSpent.reduce((acc, c) => acc + c.spentAmount, 0);
  const totalAllocated = parseFloat(budget.totalAmount);
  const remainingBudget = totalAllocated - totalSpent;

  return {
    id: budget.id,
    month: budget.month,
    year: budget.year,
    totalAmount: totalAllocated,
    totalSpent,
    remainingBudget,
    categories: categoriesWithSpent,
  };
}

export async function getCurrentMonthBudget(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return getBudgetWithStats(userId, month, year);
}

export async function getAllBudgets(userId: string) {
  return db.select().from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(desc(budgets.year), desc(budgets.month));
}

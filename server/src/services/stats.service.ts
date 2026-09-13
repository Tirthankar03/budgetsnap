import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { budgets } from '../db/schema.js';
import { getBudgetWithStats } from './budget.service.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function getArchiveStats(userId: string) {
  const userBudgets = await db.select().from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(desc(budgets.year), desc(budgets.month));

  const monthsData = await Promise.all(
    userBudgets.map(b => getBudgetWithStats(userId, b.month, b.year))
  );

  const validMonths = monthsData.filter(m => m !== null);
  const totalMonths = validMonths.length;

  if (totalMonths === 0) {
    return {
      monthsCount: 0,
      avgUsedPercent: 0,
      bestMonth: null,
      monthlyTrend: [],
      budgetsList: [],
    };
  }

  const percentages = validMonths.map(m => (m!.totalSpent / m!.totalAmount) * 100);
  const avgUsedPercent = Math.round(percentages.reduce((a, b) => a + b, 0) / totalMonths);

  // Best month = lowest percentage used
  let bestMonthIndex = 0;
  let minPercent = percentages[0];
  percentages.forEach((p, idx) => {
    if (p < minPercent) {
      minPercent = p;
      bestMonthIndex = idx;
    }
  });

  const bestMonthObj = validMonths[bestMonthIndex];
  const bestMonthStr = bestMonthObj
    ? `${MONTH_NAMES[bestMonthObj.month - 1]} ${bestMonthObj.year}`
    : null;

  const monthlyTrend = validMonths.slice().reverse().map(m => ({
    month: MONTH_NAMES[m!.month - 1],
    monthNum: m!.month,
    year: m!.year,
    spent: m!.totalSpent,
    budget: m!.totalAmount,
    usedPercent: Math.round((m!.totalSpent / m!.totalAmount) * 100),
  }));

  return {
    monthsCount: totalMonths,
    avgUsedPercent,
    bestMonth: bestMonthStr,
    monthlyTrend,
    budgetsList: validMonths,
  };
}

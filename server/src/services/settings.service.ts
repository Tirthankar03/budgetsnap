import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { userSettings } from '../db/schema.js';

export async function getUserSettings(userId: string) {
  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  if (!settings) {
    // Create default settings if none exist
    const [newSettings] = await db.insert(userSettings).values({
      userId,
      draftMode: false,
      notifCategoryLimit: true,
      notifDailySummary: false,
      notifDailySummaryTime: '21:00',
      notifMonthlyReset: true,
    }).returning();
    return newSettings;
  }
  return settings;
}

export async function updateUserSettings(userId: string, data: Partial<{
  draftMode: boolean;
  notifCategoryLimit: boolean;
  notifDailySummary: boolean;
  notifDailySummaryTime: string;
  notifMonthlyReset: boolean;
}>) {
  // Ensure settings exist first
  await getUserSettings(userId);

  const [updated] = await db.update(userSettings).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(userSettings.userId, userId)).returning();

  return updated;
}

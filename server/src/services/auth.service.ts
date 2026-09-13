import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users, userSettings } from '../db/schema.js';
import { env } from '../config/env.js';

export async function registerUser(name: string, email: string, password: string) {
  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  if (existing.length > 0) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [newUser] = await db.insert(users).values({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
  }).returning();

  // Create default user settings
  await db.insert(userSettings).values({
    userId: newUser.id,
    draftMode: false,
    notifCategoryLimit: true,
    notifDailySummary: false,
    notifDailySummaryTime: '21:00',
    notifMonthlyReset: true,
  });

  const token = jwt.sign({ userId: newUser.id }, env.JWT_SECRET, { expiresIn: '7d' });
  return {
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    token,
  };
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}

export async function getUserProfile(userId: string) {
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
  }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error('User not found');
  return user;
}

export async function updateProfile(userId: string, data: { name?: string; email?: string }) {
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (data.name) updates.name = data.name;
  if (data.email) updates.email = data.email.toLowerCase().trim();

  const [updated] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
  return { id: updated.id, name: updated.name, email: updated.email };
}

export async function deleteAccount(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
  return { success: true };
}

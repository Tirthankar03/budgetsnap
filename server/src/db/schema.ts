import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  time,
  unique
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const budgets = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.userId, t.month, t.year)
]);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  budgetId: uuid('budget_id').references(() => budgets.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  color: varchar('color', { length: 10 }).notNull(),
  allocatedAmount: numeric('allocated_amount', { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  yourShare: numeric('your_share', { precision: 12, scale: 2 }).notNull(),
  note: text('note'),
  merchant: varchar('merchant', { length: 200 }),
  paymentMethod: varchar('payment_method', { length: 20 }).default('UPI').notNull(),
  transactionDate: timestamp('transaction_date').notNull(),
  source: varchar('source', { length: 20 }).default('manual').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const splits = pgTable('splits', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull().unique(),
  splitMethod: varchar('split_method', { length: 20 }).notNull(),
  totalPeople: integer('total_people').notNull(),
});

export const splitParticipants = pgTable('split_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  splitId: uuid('split_id').references(() => splits.id, { onDelete: 'cascade' }).notNull(),
  label: varchar('label', { length: 20 }).notNull(),
  share: numeric('share', { precision: 12, scale: 2 }).notNull(),
  isYou: boolean('is_you').default(false).notNull(),
});

export const drafts = pgTable('drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }),
  merchant: varchar('merchant', { length: 200 }),
  transactionDate: timestamp('transaction_date'),
  paymentMethod: varchar('payment_method', { length: 20 }),
  rawOcrText: text('raw_ocr_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  draftMode: boolean('draft_mode').default(false).notNull(),
  notifCategoryLimit: boolean('notif_category_limit').default(true).notNull(),
  notifDailySummary: boolean('notif_daily_summary').default(false).notNull(),
  notifDailySummaryTime: time('notif_daily_summary_time').default('21:00').notNull(),
  notifMonthlyReset: boolean('notif_monthly_reset').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

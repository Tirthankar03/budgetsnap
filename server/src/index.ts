import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import draftRoutes from './routes/draft.routes.js';
import statsRoutes from './routes/stats.routes.js';
import exportRoutes from './routes/export.routes.js';
import settingsRoutes from './routes/settings.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'BudgetSnap Backend', time: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/settings', settingsRoutes);

app.listen(env.PORT, () => {
  console.log(`BudgetSnap Server running on port ${env.PORT}`);
});

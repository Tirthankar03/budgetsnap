import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createBudgetSchema } from '../validators/budget.schema.js';
import { createOrUpdateBudget, getBudgetWithStats, getCurrentMonthBudget, getAllBudgets } from '../services/budget.service.js';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createBudgetSchema.parse(req.body);
    const budget = await createOrUpdateBudget(req.userId!, data);
    res.status(201).json(budget);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save budget' });
  }
});

router.get('/current', authenticate, async (req: AuthRequest, res) => {
  try {
    const budget = await getCurrentMonthBudget(req.userId!);
    res.json(budget || null);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/all', authenticate, async (req: AuthRequest, res) => {
  try {
    const budgets = await getAllBudgets(req.userId!);
    res.json(budgets);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:month/:year', authenticate, async (req: AuthRequest, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    const budget = await getBudgetWithStats(req.userId!, month, year);
    res.json(budget || null);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

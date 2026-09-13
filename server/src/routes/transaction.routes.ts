import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createTransactionSchema } from '../validators/transaction.schema.js';
import { createTransaction, updateTransaction, getRecentTransactions, getMonthTransactions, getTransactionById, deleteTransaction } from '../services/transaction.service.js';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createTransactionSchema.parse(req.body);
    const txn = await createTransaction(req.userId!, data);
    res.status(201).json(txn);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create transaction' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const txn = await updateTransaction(req.userId!, req.params.id, {
      ...req.body,
      transactionDate: req.body.transactionDate ? new Date(req.body.transactionDate) : undefined,
    });
    res.json(txn);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update transaction' });
  }
});

router.get('/recent', authenticate, async (req: AuthRequest, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const txns = await getRecentTransactions(req.userId!, limit);
    res.json(txns);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/month/:month/:year', authenticate, async (req: AuthRequest, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    const txns = await getMonthTransactions(req.userId!, month, year);
    res.json(txns);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const txn = await getTransactionById(req.userId!, req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json(txn);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await deleteTransaction(req.userId!, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

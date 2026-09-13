import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getArchiveStats } from '../services/stats.service.js';

const router = Router();

router.get('/archive', authenticate, async (req: AuthRequest, res) => {
  try {
    const stats = await getArchiveStats(req.userId!);
    res.json(stats);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

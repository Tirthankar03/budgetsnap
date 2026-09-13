import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getUserSettings, updateUserSettings } from '../services/settings.service.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const settings = await getUserSettings(req.userId!);
    res.json(settings);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const updated = await updateUserSettings(req.userId!, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

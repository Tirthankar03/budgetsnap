import { Router } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.schema.js';
import { registerUser, loginUser, getUserProfile, updateProfile, deleteAccount } from '../services/auth.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data.name, data.email, data.password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data.email, data.password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Login failed' });
  }
});

router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await getUserProfile(req.userId!);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await updateProfile(req.userId!, req.body);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/account', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await deleteAccount(req.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createDraftSchema, resolveDraftSchema } from '../validators/draft.schema.js';
import { createDraft, getActiveDrafts, resolveDraft, deleteDraft } from '../services/draft.service.js';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createDraftSchema.parse(req.body);
    const draft = await createDraft(req.userId!, data);
    res.status(201).json(draft);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save draft' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const drafts = await getActiveDrafts(req.userId!);
    res.json(drafts);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/resolve', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = resolveDraftSchema.parse(req.body);
    const txn = await resolveDraft(req.userId!, req.params.id, data);
    res.status(201).json(txn);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to resolve draft' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await deleteDraft(req.userId!, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

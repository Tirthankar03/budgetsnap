import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateCsvExport, generatePdfExport } from '../services/export.service.js';

const router = Router();

router.get('/csv', authenticate, async (req: AuthRequest, res) => {
  try {
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const csv = await generateCsvExport(req.userId!, month, year);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=budgetsnap-${month}-${year}.csv`);
    res.send(csv);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/pdf', authenticate, async (req: AuthRequest, res) => {
  try {
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const pdfBuffer = await generatePdfExport(req.userId!, month, year);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=budgetsnap-${month}-${year}.pdf`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

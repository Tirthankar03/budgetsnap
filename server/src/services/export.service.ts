import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { getMonthTransactions } from './transaction.service.js';
import { getBudgetWithStats } from './budget.service.js';

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export async function generateCsvExport(userId: string, month: number, year: number): Promise<string> {
  const txns = await getMonthTransactions(userId, month, year);

  const data = txns.map(t => ({
    'Transaction ID': t?.id,
    'Date': t?.transactionDate ? new Date(t.transactionDate).toISOString().split('T')[0] : '',
    'Category': t?.categoryName,
    'Merchant': t?.merchant || '',
    'Payment Method': t?.paymentMethod,
    'Total Amount (INR)': t?.amount,
    'Your Share (INR)': t?.yourShare,
    'Is Split': t?.split ? 'Yes' : 'No',
    'Note': t?.note || '',
  }));

  const parser = new Parser();
  return parser.parse(data);
}

export async function generatePdfExport(userId: string, month: number, year: number): Promise<Buffer> {
  const budget = await getBudgetWithStats(userId, month, year);
  const txns = await getMonthTransactions(userId, month, year);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err: Error) => reject(err));

    const monthStr = `${MONTH_NAMES_FULL[month - 1]} ${year}`;

    // Header
    doc.fontSize(22).fillColor('#00E676').text('BudgetSnap Statement', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#333333').text(`Monthly Summary - ${monthStr}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary
    doc.fontSize(12).fillColor('#000000');
    doc.text(`Total Budget: INR ${budget?.totalAmount || 0}`);
    doc.text(`Total Spent: INR ${budget?.totalSpent || 0}`);
    doc.text(`Remaining: INR ${budget?.remainingBudget || 0}`);
    doc.moveDown(1.5);

    // Category Breakdown
    if (budget?.categories && budget.categories.length > 0) {
      doc.fontSize(14).fillColor('#00E676').text('Category Breakdown');
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333333');
      budget.categories.forEach(cat => {
        doc.text(`  ${cat.name}: INR ${cat.spentAmount} / INR ${cat.allocatedAmount} (${Math.round((cat.spentAmount / cat.allocatedAmount) * 100)}% used)`);
      });
      doc.moveDown(1.5);
    }

    // Transactions
    doc.fontSize(14).fillColor('#00E676').text('Transactions');
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#333333');

    txns.forEach((t) => {
      if (!t) return;
      const dateStr = new Date(t.transactionDate).toISOString().split('T')[0];
      doc.text(`${dateStr}  |  ${t.categoryName}  |  ${t.merchant || 'N/A'}  |  INR ${t.amount}  |  Your Share: INR ${t.yourShare}`);
    });

    doc.end();
  });
}

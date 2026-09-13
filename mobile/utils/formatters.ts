export function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('en-IN', { month: 'short' });
  return `${day} ${month}`;
}

export function formatDateFull(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(date);
}

export function getDaysLeftInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1; // include today
}

export function getSafeToSpendPerDay(remaining: number): number {
  const daysLeft = getDaysLeftInMonth();
  if (daysLeft <= 0) return 0;
  return Math.round(remaining / daysLeft);
}

export function getPercentUsed(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((spent / total) * 100), 100);
}

export function getExpiresInText(expiresAt: string): string {
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffMs = exp.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffHours < 0) return 'Expired';
  if (diffHours < 1) return 'Expires soon';
  if (diffHours < 24) return `Expires in ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Expires in ${diffDays}d`;
}

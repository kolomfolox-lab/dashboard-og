export function cn(...classes: Array<string | boolean | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

export function formatMoney(value: number | string | undefined | null) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(value: number | string | undefined | null) {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(value || 0));
}

export function formatDateTime(value: string | undefined | null) {
  if (!value) {
    return 'No timestamp';
  }
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

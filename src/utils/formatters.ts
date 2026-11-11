export function formatINR(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}

export function formatCompactNumber(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatPercent(value: number | string | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || value === '') return '0%';
  const num = Number(value);
  if (!Number.isFinite(num)) return '0%';
  const rounded = Number(num.toFixed(decimals));
  return `${rounded}%`;
}

export function formatDurationSeconds(totalSeconds: number | string | null | undefined): string {
  const sec = Math.max(0, Math.round(Number(totalSeconds ?? 0)));
  if (!Number.isFinite(sec) || sec === 0) return '0s';
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remSec = sec % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${remSec}s`;
  return `${remSec}s`;
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusBadgeClasses(status?: string | null): string {
  const normalized = String(status || '').trim().toUpperCase();
  switch (normalized) {
    case 'SUCCESS':
    case 'ACTIVE':
    case 'PUBLISHED':
    case 'COMPLETED':
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'PENDING':
    case 'SCHEDULED':
    case 'ONGOING':
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'FAILED':
    case 'CANCELLED':
    case 'REVOKED':
    case 'BLOCKED':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'REFUNDED':
    case 'EXPIRED':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const maybeAxios = err as {
      response?: { data?: { message?: string; error?: string } | string };
      message?: string;
    };
    const respData = maybeAxios.response?.data;
    if (typeof respData === 'string' && respData.trim()) return respData;
    if (respData && typeof respData === 'object') {
      if (respData.message) return respData.message;
      if (respData.error) return respData.error;
    }
    if (maybeAxios.message) return maybeAxios.message;
  }
  return fallback;
}


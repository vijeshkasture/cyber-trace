export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function truncateHash(hash, front = 8, back = 6) {
  if (!hash) return '—';
  if (hash.length <= front + back) return hash;
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
}

export function getSeverityClasses(severity) {
  const s = String(severity || '').toUpperCase();
  switch (s) {
    case 'CRITICAL':
      return {
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        text: 'text-red-700',
        border: 'border-red-300'
      };
    case 'HIGH':
      return {
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
        text: 'text-orange-700',
        border: 'border-orange-300'
      };
    case 'MED':
    case 'MEDIUM':
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        text: 'text-amber-800',
        border: 'border-amber-300'
      };
    case 'LOW':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        border: 'border-emerald-300'
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        text: 'text-slate-600',
        border: 'border-slate-200'
      };
  }
}

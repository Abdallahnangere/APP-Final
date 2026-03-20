const RAW_ADMIN_PORTAL_PATH = process.env.NEXT_PUBLIC_ADMIN_PORTAL_PATH || process.env.ADMIN_PORTAL_PATH || '/zmytcd';

function normalizePath(path: string): string {
  const trimmed = (path || '').trim();
  if (!trimmed) return '/zmytcd';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '') || '/zmytcd';
}

export const ADMIN_PORTAL_PATH = normalizePath(RAW_ADMIN_PORTAL_PATH);

export function adminPortalUrl(subPath = ''): string {
  const normalizedSubPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  return `${ADMIN_PORTAL_PATH}${normalizedSubPath}`;
}
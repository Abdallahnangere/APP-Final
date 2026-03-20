const RAW_ADMIN_PORTAL_PATH = process.env.NEXT_PUBLIC_ADMIN_PORTAL_PATH || process.env.ADMIN_PORTAL_PATH || '/control/meridian-black-26m';

function normalizePath(path: string): string {
  const trimmed = (path || '').trim();
  if (!trimmed) return '/control/meridian-black-26m';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '') || '/control/meridian-black-26m';
}

export const ADMIN_PORTAL_PATH = normalizePath(RAW_ADMIN_PORTAL_PATH);

export function adminPortalUrl(subPath = ''): string {
  const normalizedSubPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  return `${ADMIN_PORTAL_PATH}${normalizedSubPath}`;
}
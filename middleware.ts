import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PORTAL_PATH } from '@/lib/adminPortal';

function isBypassPath(pathname: string): boolean {
  return pathname.startsWith('/_next')
    || pathname.startsWith('/api')
    || pathname.startsWith('/images')
    || pathname === '/favicon.ico'
    || pathname.includes('.');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const normalizedAdminRoot = ADMIN_PORTAL_PATH.endsWith('/') ? ADMIN_PORTAL_PATH.slice(0, -1) : ADMIN_PORTAL_PATH;
  if (pathname.startsWith(`${normalizedAdminRoot}/`) && pathname !== `${normalizedAdminRoot}/`) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
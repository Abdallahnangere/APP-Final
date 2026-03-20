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

  if (pathname === `${ADMIN_PORTAL_PATH}/support`) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (pathname === ADMIN_PORTAL_PATH || pathname.startsWith(`${ADMIN_PORTAL_PATH}/`)) {
    const suffix = pathname.slice(ADMIN_PORTAL_PATH.length);
    if (suffix === '/support') {
      return new NextResponse('Not Found', { status: 404 });
    }

    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = `/admin${suffix || ''}`;
    const response = NextResponse.rewrite(rewriteUrl);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'same-origin');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
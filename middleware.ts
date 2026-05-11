import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware provides client-side route protection
// For full protection, also use AuthContext in layout files

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/forgot-password'];
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith('/_next'));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Redirect root to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For protected routes, the AuthContext in layout files handles redirects
  // This middleware is mainly for additional security headers
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

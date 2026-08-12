import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!role) {
      // Unauthenticated -> send to login
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    if (role !== 'admin') {
      // Authenticated but not an admin -> send to user dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect regular dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!role) {
      // Unauthenticated -> send to login
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on these paths
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};

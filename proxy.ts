import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/employee-login', '/manager-login', '/forgot-password', '/login', '/signup'];

// Define role-based route prefixes
const managerRoutes = ['/manager'];
const employeeRoutes = ['/employee'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow _next routes (Next.js internal)
  if (pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Allow all API routes (no auth check for APIs)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get session from cookie
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie?.value) {
    // No session - redirect to home with callback URL
    const url = new URL('/', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Verify session
  const session = await decrypt(sessionCookie.value);

  if (!session) {
    // Invalid session - redirect to home
    const url = new URL('/', request.url);
    url.searchParams.set('callbackUrl', pathname);
    
    // Delete invalid session cookie
    const response = NextResponse.redirect(url);
    response.cookies.delete('session');
    return response;
  }

  // Check role-based access
  const isManagerRoute = managerRoutes.some(route => pathname.startsWith(route));
  const isEmployeeRoute = employeeRoutes.some(route => pathname.startsWith(route));

  if (isManagerRoute && session.role !== 'manager') {
    // Employee trying to access manager route - redirect to employee dashboard
    return NextResponse.redirect(new URL('/employee', request.url));
  }

  if (isEmployeeRoute && session.role !== 'employee') {
    // Manager trying to access employee route - redirect to manager dashboard
    return NextResponse.redirect(new URL('/manager', request.url));
  }

  // Check /settings route - available for both roles
  if (pathname.startsWith('/settings')) {
    // Allow both roles
    return NextResponse.next();
  }

  // Valid session and authorized - continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

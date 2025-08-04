import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // If not logged in, allow the request to continue
  if (!token) {
    return NextResponse.next();
  }

  // Check if user needs to change password
  if (token.requirePasswordChange === true) {
    // If already on the change password page, allow
    if (request.nextUrl.pathname === '/auth/change-password') {
      return NextResponse.next();
    }
    
    // If trying to access API routes, allow (needed for the change password functionality)
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    // Redirect to change password page
    const url = new URL('/auth/change-password', request.url);
    return NextResponse.redirect(url);
  }

  // Enhanced Role-based access control with RBAC
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Master admin has full access
  if (token.role === 'master_admin') {
    return NextResponse.next();
  }

  // Admin access control
  if (pathname.startsWith('/admin')) {
    // Only master_admin and admin can access admin pages
    if (!['master_admin', 'admin'].includes(token.role)) {
      const url = new URL('/dashboard', request.url);
      return NextResponse.redirect(url);
    }
    
    // Specific admin page restrictions
    if (pathname.startsWith('/admin/permissions') || pathname.startsWith('/admin/seed-rbac')) {
      // Only master_admin can access permission management and RBAC setup
      if (token.role !== 'master_admin') {
        const url = new URL('/admin', request.url);
        return NextResponse.redirect(url);
      }
    }
  }

  // Doctor access control
  if (token.role === 'doctor') {
    // Doctors can't access user management
    if (pathname.startsWith('/admin/users')) {
      const url = new URL('/dashboard', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Patient access control
  if (token.role === 'patient') {
    // Patients have very limited access
    const allowedPaths = [
      '/dashboard',
      '/dashboard/profile',
      '/auth/change-password'
    ];
    
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));
    if (!isAllowed) {
      const url = new URL('/dashboard', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/change-password'
  ],
};
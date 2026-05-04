import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  const isProtectedRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/faculty') || 
    pathname.startsWith('/student');

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Note: Role-based enforcement happens in the client-side layouts
    // where the full auth state is hydrated from localStorage.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/faculty/:path*', 
    '/student/:path*',
    '/login'
  ],
};

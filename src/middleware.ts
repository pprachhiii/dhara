import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  const authPages = ['/auth/login', '/auth/register'];

  const protectedExactRoutes = ['/reports/new', '/authority/new'];

  if (!token && protectedExactRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Logged-in users should not access auth pages
  if (token && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/reports/new', '/authority/new', '/auth/login', '/auth/register'],
};

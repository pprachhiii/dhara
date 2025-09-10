import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if ((pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",   // protect APIs
    "/auth/login",
    "/auth/register",
  ],
};

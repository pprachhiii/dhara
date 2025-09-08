import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Restrict auth pages for logged-in users ---
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    const token = request.cookies.get("token")?.value; 
    // 👆 safer than localStorage because middleware runs on server

    if (token) {
      // already logged in → redirect away
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // --- Allow API register/login without token ---
  if (pathname.startsWith("/api/auth/register") || pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  // --- Protect API write operations ---
  if (pathname.startsWith("/api/") && ["POST", "PATCH", "DELETE"].includes(request.method)) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // TODO: validate token (e.g., JWT verify)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",   // protect APIs
    "/auth/login",   // check auth page access
    "/auth/register" // check auth page access
  ],
};

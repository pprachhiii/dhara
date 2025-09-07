import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Only protect POST, PATCH, DELETE
  if (["POST", "PATCH", "DELETE"].includes(request.method)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // GET requests remain public
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

import { NextRequest, NextResponse } from "next/server";

// Helper to require authentication in API routes
export async function requireAuth(request: NextRequest) {
  // Expect token in Authorization header: "Bearer <token>"
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: true,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = authHeader.split(" ")[1];

  // TODO: validate token (e.g., verify JWT or check in DB)
  if (!token) {
    return {
      error: true,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // If needed, you can decode the token to get user info
  const user = { email: "user@example.com", id: "current-user-id" }; // replace with real decoded token info

  return { error: false, user };
}

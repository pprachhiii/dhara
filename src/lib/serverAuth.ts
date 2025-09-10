import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export type AuthResponse = {
  error: boolean;
  user?: { id: string; email: string };
  response?: NextResponse;
};

export async function requireAuth(request: NextRequest): Promise<AuthResponse> {
  const cookieToken = request.cookies.get("token")?.value;
  const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
  const token = cookieToken || headerToken;

  if (!token) {
    return {
      error: true,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!process.env.JWT_SECRET) {
    return {
      error: true,
      response: NextResponse.json({ error: "Server misconfiguration" }, { status: 500 }),
    };
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & { sub: string; email: string };
    return {
      error: false,
      user: { id: payload.sub, email: payload.email },
    };
  } catch {
    return {
      error: true,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

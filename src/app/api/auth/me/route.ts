import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface DecodedToken extends JwtPayload {
  id?: string;
  email?: string;
  role?: "USER" | "VOLUNTEER";
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded.id && !decoded.email) {
      return NextResponse.json({ error: "Token missing user info" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: decoded.id ? { id: decoded.id } : { email: decoded.email! },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
        role: user.role,
      },
    }, { status: 200 });
  } catch (err) {
    console.error("[AUTH_ME] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

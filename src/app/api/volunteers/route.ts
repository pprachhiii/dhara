import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/serverAuth";

type AuthResponse = {
  error: boolean;
  user?: { id: string; email: string };
  response?: NextResponse;
};

export async function GET() {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { joinedAt: "desc" },
      include: { tasks: true, user: true },
    });

    return NextResponse.json(volunteers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = (await requireAuth(req)) as AuthResponse;
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { phone } = await req.json();

    // Check if volunteer already exists
    const existing = await prisma.volunteer.findUnique({
      where: { userId: authResult.user.id },
    });

    if (existing) {
      return NextResponse.json({ error: "Volunteer already exists for this user" }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        userId: authResult.user.id,
        phone: phone || null,
      },
      include: { user: true },
    });

    return NextResponse.json({ message: "Volunteer registered", volunteer }, { status: 201 });
  } catch (err) {
    console.error("POST  error:", err);
    return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
  }
}

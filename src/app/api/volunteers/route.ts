import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/volunteers → list all volunteers
export async function GET() {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { joinedAt: "desc" },
      include: { tasks: true },
    });

    return NextResponse.json(volunteers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  }
}

// POST /api/volunteers → register new volunteer
// Body: { name: string, email?: string, phone?: string }
export async function POST(req: NextRequest) {
  try {
    const { userId, phone } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if volunteer already exists for this user
    const existing = await prisma.volunteer.findUnique({
      where: { userId },
    });

    if (existing) {
      return NextResponse.json({ error: "Volunteer already exists for this user" }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        userId,
        phone: phone || null,
      },
      include: { user: true }, // include user info if needed
    });

    return NextResponse.json({ message: "Volunteer registered", volunteer }, { status: 201 });
  } catch (err) {
    console.error("POST /volunteer error:", err);
    return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
  }
}


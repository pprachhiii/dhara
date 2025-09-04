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
    const { name, email, phone } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.create({
      data: { name, email: email || null, phone: phone || null },
    });

    return NextResponse.json({ message: "Volunteer registered", volunteer }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
  }
}

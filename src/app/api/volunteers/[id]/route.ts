import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Context } from "@/lib/context";

// GET /api/volunteers/:id → volunteer profile
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json(volunteer);
  } catch {
    return NextResponse.json({ error: "Failed to fetch volunteer" }, { status: 500 });
  }
}

// PATCH /api/volunteers/:id → update volunteer
// Body: { name?: string, email?: string, phone?: string }
export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const updated = await prisma.volunteer.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
      },
    });

    return NextResponse.json({ message: "Volunteer updated", volunteer: updated });
  } catch {
    return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
  }
}

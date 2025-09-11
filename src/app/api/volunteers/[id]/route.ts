import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Context } from "@/lib/context";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/volunteers/:id → volunteer profile (public for now)
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: { tasks: true, user: true },
    });

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json(volunteer);
  } catch (err) {
    console.error("Error fetching volunteer:", err);
    return NextResponse.json({ error: "Failed to fetch volunteer" }, { status: 500 });
  }
}

// PATCH /api/volunteers/:id → update volunteer (requires auth)
export async function PATCH(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;
    const data = await request.json();

    // Only allow user to update their own volunteer profile
    const volunteer = await prisma.volunteer.findUnique({ where: { id } });
    if (!volunteer || volunteer.userId !== authResult.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.volunteer.update({
      where: { id },
      data: {
        phone: data.phone ?? undefined,
      },
    });

    return NextResponse.json({ message: "Volunteer updated", volunteer: updated });
  } catch (err) {
    console.error("Error updating volunteer:", err);
    return NextResponse.json({ error: "Volunteer not found or update failed" }, { status: 404 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorityCategory, AuthorityRole } from "@prisma/client";
import { Context } from "@/lib/context";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/authority/:id (can be public)
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const authority = await prisma.authority.findUnique({
      where: { id },
      include: { reportAuthorities: { include: { report: true } } },
    });

    if (!authority) {
      return NextResponse.json({ error: "Authority not found" }, { status: 404 });
    }
    return NextResponse.json(authority);
  } catch (err) {
    console.error("Error fetching authority:", err);
    return NextResponse.json({ error: "Error fetching authority" }, { status: 500 });
  }
}

// PATCH /api/authority/:id → update authority (requires auth)
export async function PATCH(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;
    const data = await request.json();

    if (data.category && !Object.values(AuthorityCategory).includes(data.category)) {
      return NextResponse.json({ error: "Invalid authority category" }, { status: 400 });
    }

    if (data.role && !Object.values(AuthorityRole).includes(data.role)) {
      return NextResponse.json({ error: "Invalid authority role" }, { status: 400 });
    }

    const updatedAuthority = await prisma.authority.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category as AuthorityCategory }),
        ...(data.role && { role: data.role as AuthorityRole }),
        ...(data.city && { city: data.city }),
        region: data.region ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        website: data.website ?? null,
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    return NextResponse.json({
      message: "Authority updated successfully",
      authority: updatedAuthority,
    });
  } catch (err) {
    console.error("Error updating authority:", err);
    return NextResponse.json({ error: "Authority not found" }, { status: 404 });
  }
}

// DELETE /api/authority/:id → delete authority (requires auth)
export async function DELETE(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;
    await prisma.authority.delete({ where: { id } });

    return NextResponse.json({ message: "Authority deleted successfully" });
  } catch (err) {
    console.error("Error deleting authority:", err);
    return NextResponse.json({ error: "Authority not found" }, { status: 404 });
  }
}

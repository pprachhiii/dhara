import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorityType } from "@prisma/client";
import { Context } from "@/lib/context";

// GET /api/authority/:id
export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;

    const authority = await prisma.authority.findUnique({
      where: { id },
      include: {
        reportAuthorities: {
          include: {
            report: true, // also fetch reports linked to this authority
          },
        },
      },
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

// PUT /api/authority/:id
export async function PUT(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    // Validate AuthorityType if provided
    if (data.type && !Object.values(AuthorityType).includes(data.type)) {
      return NextResponse.json({ error: "Invalid authority type" }, { status: 400 });
    }

    const updatedAuthority = await prisma.authority.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type as AuthorityType }),
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

// DELETE /api/authority/:id
export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;

    // Hard delete (⚠️ irreversible)
    await prisma.authority.delete({ where: { id } });

    return NextResponse.json({ message: "Authority deleted successfully" });
  } catch (err) {
    console.error("Error deleting authority:", err);
    return NextResponse.json({ error: "Authority not found" }, { status: 404 });
  }
}

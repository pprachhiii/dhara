import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorityType } from "@prisma/client";

// GET /api/authority/:id
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params; 
    const authority = await prisma.authority.findUnique({ where: { id } });

    if (!authority) {
      return NextResponse.json({ error: "Authority not found" }, { status: 404 });
    }

    return NextResponse.json(authority);
  } catch {
    return NextResponse.json({ error: "Error fetching authority" }, { status: 500 });
  }
}

// PUT /api/authority/:id
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await request.json();

  try {
    const updatedAuthority = await prisma.authority.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type as AuthorityType,
        city: data.city,
        region: data.region || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        active: data.active ?? false,
      },
    });

    return NextResponse.json({
      message: "Authority updated successfully",
      authority: updatedAuthority,
    });
  } catch {
    return NextResponse.json({ error: "Authority not found" }, { status: 404 });
  }
}

// DELETE /api/authority/:id
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await prisma.authority.delete({ where: { id } });
    return NextResponse.json({ message: "Authority deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Authority not found" }, { status: 404 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactStatus } from "@prisma/client";
import { Context } from "@/lib/context";

// GET /api/reportAuthorities/:id
export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;

    const record = await prisma.reportAuthority.findUnique({
      where: { id },
      include: { report: true, authority: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Report-Authority record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Failed to fetch record" }, { status: 500 });
  }
}

// PATCH /api/reportAuthorities/:id
export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const updatedRecord = await prisma.reportAuthority.update({
      where: { id },
      data: {
        volunteer: data.volunteer ?? undefined,
        status:
          data.status && Object.values(ContactStatus).includes(data.status)
            ? (data.status as ContactStatus)
            : undefined,
        contactedAt: data.contactedAt ? new Date(data.contactedAt) : undefined,
      },
    });

    return NextResponse.json({ message: "Record updated successfully", record: updatedRecord });
  } catch {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
}

// DELETE /api/reportAuthorities/:id
export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    await prisma.reportAuthority.delete({ where: { id } });
    return NextResponse.json({ message: "Record deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
}

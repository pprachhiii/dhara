import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactStatus } from "@prisma/client";

// GET /api/reportAuthorities/:id
export async function GET({ params }: { params: { id: string } }) {
  try {
    const record = await prisma.reportAuthority.findUnique({
      where: { id: params.id },
      include: { report: true, authority: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Report-Authority record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch  {
    return NextResponse.json({ error: "Failed to fetch record" }, { status: 500 });
  }
}

// PATCH /api/reportAuthorities/:id
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();

    const updatedRecord = await prisma.reportAuthority.update({
      where: { id: params.id },
      data: {
        volunteer: data.volunteer ?? undefined,
        status: data.status && Object.values(ContactStatus).includes(data.status)
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
export async function DELETE({ params }: { params: { id: string } }) {
  try {
    await prisma.reportAuthority.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Record deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
}

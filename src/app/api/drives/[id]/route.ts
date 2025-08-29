import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/drives/:id
export async function GET({ params }: { params: { id: string } }) {
  try {
    const drive = await prisma.drive.findUnique({
      where: { id: params.id },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    return NextResponse.json(drive);
  } catch {
    return NextResponse.json({ error: "Failed to fetch drive" }, { status: 500 });
  }
}

// PATCH /api/drives/:id
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();

    const updatedDrive = await prisma.drive.update({
      where: { id: params.id },
      data: {
        participant: data.participant,
        date: data.date ? new Date(data.date) : undefined,
        title: data.title,
        description: data.description ?? null,
      },
    });

    return NextResponse.json({ message: "Drive updated successfully", drive: updatedDrive });
  } catch {
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }
}

// DELETE /api/drives/:id
export async function DELETE({ params }: { params: { id: string } }) {
  try {
    await prisma.drive.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Drive deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }
}

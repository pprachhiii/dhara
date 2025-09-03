import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Context } from "@/lib/context";

// GET /api/drives/:id
export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    const drive = await prisma.drive.findUnique({ where: { id } });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    return NextResponse.json(drive);
  } catch {
    return NextResponse.json({ error: "Failed to fetch drive" }, { status: 500 });
  }
}

// PATCH /api/drives/:id
export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const updatedDrive = await prisma.drive.update({
      where: { id },
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
export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    await prisma.drive.delete({ where: { id } });
    return NextResponse.json({ message: "Drive deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }
}

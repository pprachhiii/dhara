import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Context } from "@/lib/context";

// GET /api/drives/:id
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const drive = await prisma.drive.findUnique({
      where: { id },
      include: {
        reports: { include: { report: true } }, // DriveReport -> Report
        votes: true,
        tasks: true,
        beautify: true,
        monitorings: true,
      },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    return NextResponse.json(drive);
  } catch (err) {
    console.error("Error fetching drive:", err);
    return NextResponse.json({ error: "Failed to fetch drive" }, { status: 500 });
  }
}

// PATCH /api/drives/:id
export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const updatedDrive = await prisma.drive.update({
      where: { id },
      data: {
        title: typeof data.title === "string" ? data.title : undefined,
        description: data.description ?? undefined,
        participant: Number.isFinite(Number(data.participant))
          ? Number(data.participant)
          : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status, // DriveStatus enum (PLANNED/ONGOING/COMPLETED)
      },
      include: {
        reports: { include: { report: true } },
        votes: true,
        tasks: true,
        beautify: true,
        monitorings: true,
      },
    });

    return NextResponse.json({
      message: "Drive updated successfully",
      drive: updatedDrive,
    });
  } catch (err) {
    console.error("Error updating drive:", err);
    return NextResponse.json({ error: "Drive not found or update failed" }, { status: 404 });
  }
}

// DELETE /api/drives/:id
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    await prisma.drive.delete({ where: { id } });

    return NextResponse.json({ message: "Drive deleted successfully" });
  } catch (err) {
    console.error("Error deleting drive:", err);
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }
}

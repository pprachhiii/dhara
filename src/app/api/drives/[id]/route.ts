import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Context } from "@/lib/context";
import { requireAuth } from "@/lib/serverAuth";

// -------------------- GET /api/drives/:id --------------------
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const drive = await prisma.drive.findUnique({
      where: { id },
      include: {
        reports: { include: { report: true } }, // includes linked Report
        tasks: true,
        votes: true,
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

// -------------------- PATCH /api/drives/:id --------------------
export async function PATCH(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;
    const data = await request.json();

    const updatedDrive = await prisma.drive.update({
      where: { id },
      data: {
        title: typeof data.title === "string" ? data.title : undefined,
        description: typeof data.description === "string" ? data.description : undefined,
        participant: Number.isFinite(Number(data.participant)) ? Number(data.participant) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status, 
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

// -------------------- DELETE /api/drives/:id --------------------
export async function DELETE(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;

    // delete dependent rows
    await prisma.task.deleteMany({ where: { driveId: id } });
    await prisma.driveReport.deleteMany({ where: { driveId: id } });
    await prisma.driveVote.deleteMany({ where: { driveId: id } });
    await prisma.beautification.deleteMany({ where: { driveId: id } });
    await prisma.monitoring.deleteMany({ where: { driveId: id } });

    // delete the drive itself
    await prisma.drive.delete({ where: { id } });

    return NextResponse.json({ message: "Drive deleted successfully" });
  } catch (err) {
    console.error("Error deleting drive:", err);
    return NextResponse.json({ error: "Failed to delete drive" }, { status: 500 });
  }
}

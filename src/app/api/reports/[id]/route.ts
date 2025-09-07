import { Context } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/reports/:id (public)
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reportAuthorities: { include: { authority: true } },
        drives: { include: { drive: true } },
        votes: true,
        tasks: true,
        monitorings: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

// PATCH /api/reports/:id (protected)
export async function PATCH(request: NextRequest, context: Context) {
  const { error,response } = await requireAuth(request);
  if (error) return response;

  const { id } = await context.params;
  const data = await request.json();

  try {
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const updateData: Partial<typeof existing> = { ...data };

    if (data.status && data.status !== existing.status) {
      switch (data.status as ReportStatus) {
        case ReportStatus.AUTHORITY_CONTACTED:
          updateData.eligibleAt = new Date();
          break;
        case ReportStatus.IN_PROGRESS:
        case ReportStatus.RESOLVED:
          updateData.eligibleAt = null;
          break;
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedReport);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

// DELETE /api/reports/:id (protected)
export async function DELETE(request: NextRequest, context: Context) {
  const { error, response } = await requireAuth(request);
  if (error) return response;

  const { id } = await context.params;

  try {
    await prisma.task.deleteMany({ where: { reportId: id } });
    await prisma.reportAuthority.deleteMany({ where: { reportId: id } });
    await prisma.driveReport.deleteMany({ where: { reportId: id } });
    await prisma.monitoring.deleteMany({ where: { reportId: id } });

    await prisma.report.delete({ where: { id } });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}

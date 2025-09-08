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
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

    const { id } = await context.params;
  const data = await request.json();

  try {
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Only allow valid fields to be updated
    const updateData: Partial<{
      title: string;
      description: string;
      status: ReportStatus;
      imageUrl?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      city?: string | null;
      region?: string | null;
      country?: string | null;
      pinCode?: string | null;
    }> = { ...data };

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
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

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

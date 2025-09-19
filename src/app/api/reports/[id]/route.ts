import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";
import { Context } from "@/lib/context"; 

// GET /api/reports/:id (public)
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params; 
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reportAuthorities: { include: { authority: true } },
        drives: { include: { drive: true } },
        unifiedVotes: true,
        tasks: {
          include: {
            report: true,
            drive: true,
            volunteer: {
              include: { user: true },
            },
          },
        },
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

    // Whitelist fields allowed for update
    const updateData: {
      title?: string;
      description?: string;
      status?: ReportStatus;
      media?: string[];
      latitude?: number | null;
      longitude?: number | null;
      city?: string | null;
      region?: string | null;
      country?: string | null;
      pinCode?: string | null;
    } = {};

    if (typeof data.title === "string") updateData.title = data.title.trim();
    if (typeof data.description === "string") updateData.description = data.description.trim();

    if (data.status) {
      if (!Object.values(ReportStatus).includes(data.status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      updateData.status = data.status as ReportStatus;
    }

    if (Array.isArray(data.media)) updateData.media = data.media;
    if (typeof data.latitude === "number" || data.latitude === null) updateData.latitude = data.latitude;
    if (typeof data.longitude === "number" || data.longitude === null) updateData.longitude = data.longitude;
    if (typeof data.city === "string" || data.city === null) updateData.city = data.city;
    if (typeof data.region === "string" || data.region === null) updateData.region = data.region;
    if (typeof data.country === "string" || data.country === null) updateData.country = data.country;
    if (typeof data.pinCode === "string" || data.pinCode === null) updateData.pinCode = data.pinCode;

    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedReport);
  } catch (err) {
    console.error("PATCH /api/reports/:id error:", err);
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

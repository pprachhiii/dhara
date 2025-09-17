import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/serverAuth";
import { Context } from "@/lib/context";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { reportId, driveId }: { reportId?: string; driveId?: string } = await req.json();
    const userId = auth.user.id;

    // Ensure Volunteer exists
    let volunteer = await prisma.volunteer.findUnique({ where: { userId } });
    if (!volunteer) {
      volunteer = await prisma.volunteer.create({ data: { userId } });
      await prisma.user.update({
        where: { id: userId },
        data: { role: "VOLUNTEER" },
      });
    }

    // If joining through drive, also link DriveVolunteer
    let finalReportId = reportId;
    if (driveId) {
      const drive = await prisma.drive.findUnique({
        where: { id: driveId },
        include: { reports: true },
      });

      if (!drive) {
        return NextResponse.json({ error: "Drive not found" }, { status: 404 });
      }

      // Link volunteer to drive
      await prisma.driveVolunteer.upsert({
        where: { driveId_volunteerId: { driveId, volunteerId: volunteer.id } },
        update: {},
        create: { driveId, volunteerId: volunteer.id },
      });

      // Pick first linked report (every drive has reports in schema)
      finalReportId = drive.reports[0]?.reportId ?? null;
    }

    if (!finalReportId) {
      return NextResponse.json({ error: "No report linked" }, { status: 400 });
    }

    return NextResponse.json({ message: "Volunteer role confirmed", reportId: finalReportId });
  } catch (err) {
    console.error("POST /api/volunteer error:", err);
    return NextResponse.json({ error: "Failed to volunteer" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context : Context
) {
  const auth = await requireAuth(req);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const {id} = await context.params;

    const report = await prisma.report.findUnique({
      where: { id: id },
      include: {
        tasks: {
          include: {
            volunteer: { include: { user: true } },
            drive: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ tasks: report.tasks });
  } catch (err) {
    console.error("GET /api/reports/[id]/tasks error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, ReportStatus } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

const REQUIRED_STATUS: ReportStatus = "ELIGIBLE_FOR_DRIVE";

interface TaskInput {
  engagement: Prisma.TaskCreateManyInput["engagement"];
  title?: string;
  description?: string;
}

interface DriveInput {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  participant?: number;
  linkedReports?: string[]; // multiple can be shown, but only one will be picked
  taskBreakdown?: TaskInput[];
  reportId?: string; // alternate way if frontend passes just one
}

// ---------------- GET /api/drives ----------------
export async function GET(_request: NextRequest) {
  try {
    const drives = await prisma.drive.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reports: { include: { report: true } },
        unifiedVotes: { include: { user: true } },
        tasks: true,
        enhancements: true,
        monitorings: true,
      },
    });
    return NextResponse.json(drives);
  } catch (err) {
    console.error("Error fetching drives:", err);
    return NextResponse.json({ error: "Failed to fetch drives" }, { status: 500 });
  }
}

// ---------------- POST /api/drives ----------------
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const body: DriveInput = await request.json();

    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
    }

    // --- Reports ---
    let reportIds: string[] = [];
    if (Array.isArray(body.linkedReports)) {
      reportIds = body.linkedReports.filter((id): id is string => typeof id === "string");
    } else if (typeof body.reportId === "string") {
      reportIds = [body.reportId];
    }

    if (reportIds.length !== 1) {
      return NextResponse.json({ error: "Exactly one report must be selected" }, { status: 400 });
    }

    const selectedReport = await prisma.report.findUnique({
      where: { id: reportIds[0] },
      select: { id: true, status: true },
    });

    if (!selectedReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (selectedReport.status !== REQUIRED_STATUS) {
      return NextResponse.json(
        { error: `Drive can only be created for reports with status ${REQUIRED_STATUS}` },
        { status: 400 }
      );
    }

    // --- Dates ---
    const parseDate = (d?: string) => (d ? new Date(d) : undefined);
    const startDate = parseDate(body.startDate) ?? new Date();
    const endDate = parseDate(body.endDate);

    // --- Participant count ---
    const participant = Number.isFinite(Number(body.participant)) ? Number(body.participant) : 0;

    // --- Tasks ---
    const tasksData: Prisma.TaskCreateWithoutDriveInput[] =
      body.taskBreakdown?.map((task) => ({
        engagement: task.engagement,
        title: task.title ?? "Task",
        description: task.description ?? "",
        status: "OPEN",
        report: { connect: { id: selectedReport.id } }, // ✅ link each task to selected report
      })) ?? [];

    // --- Create Drive ---
    const drive = await prisma.drive.create({
      data: {
        title,
        description: body.description,
        participant,
        startDate,
        endDate,
        reports: {
          create: [
            {
              reportId: selectedReport.id, // ✅ obeys DriveReport schema
            },
          ],
        },
        tasks: { create: tasksData },
      },
      include: {
        reports: { include: { report: true } },
        unifiedVotes: { include: { user: true } },
        tasks: true,
        enhancements: true,
        monitorings: true,
      },
    });

    return NextResponse.json(drive, { status: 201 });
  } catch (err) {
    console.error("Error creating drive:", err);
    return NextResponse.json({ error: "Failed to create drive" }, { status: 500 });
  }
}

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
  linkedReports?: string[];
  taskBreakdown?: TaskInput[];
  reportId?: string;
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

    if (!reportIds.length) {
      return NextResponse.json({ error: "At least one report is required" }, { status: 400 });
    }

    const foundReports = await prisma.report.findMany({
      where: { id: { in: reportIds } },
      select: { id: true, title: true, description: true, status: true },
    });

    const missingReports = reportIds.filter((id) => !foundReports.some((r) => r.id === id));
    if (missingReports.length) {
      return NextResponse.json({ error: "Some reports not found", missingReports }, { status: 404 });
    }

    const ineligible = foundReports.filter((r) => r.status !== REQUIRED_STATUS);
    if (ineligible.length) {
      return NextResponse.json(
        {
          error: `Drive can only be created for reports with status ${REQUIRED_STATUS}`,
          ineligible: ineligible.map((r) => ({ id: r.id, status: r.status })),
        },
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
    const tasksData: Prisma.TaskCreateManyInput[] =
      body.taskBreakdown?.map((task) => ({
        reportId: foundReports[0].id,
        engagement: task.engagement,
        title: task.title ?? "Task",
        description: task.description ?? "",
        status: "OPEN",
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
          create: foundReports.map((r) => ({
            report: { connect: { id: r.id } },
            title: r.title,
            description: r.description,
          })),
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

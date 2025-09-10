import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const REQUIRED_STATUS = "ELIGIBLE_DRIVE";

interface TaskInput {
  title: string;
  description: string;
  comfort: "SOLO" | "DUAL" | "GROUP";
}

interface DriveInput {
  title: string;
  description?: string;
  proposedDate: string;
  endDate?: string;
  participant?: number;
  linkedReports?: string[];
  taskBreakdown?: TaskInput[];
  reportId?: string;
}

export async function GET(_request: NextRequest) {
  try {
    const drives = await prisma.drive.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reports: { include: { report: true } },
        votes: true,
        tasks: true,
        beautify: true,
        monitorings: true,
      },
    });
    return NextResponse.json(drives);
  } catch (err: unknown) {
    console.error("Error fetching drives:", err);
    return NextResponse.json({ error: "Failed to fetch drives" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DriveInput = await request.json();

    // --- Validate Title ---
    const title = body.title?.trim();
    if (!title) return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });

    // --- Reports ---
    let reportIds: string[] = [];
    if (Array.isArray(body.linkedReports)) reportIds = body.linkedReports.filter((id): id is string => typeof id === "string");
    else if (typeof body.reportId === "string") reportIds = [body.reportId];

    let reports: { id: string; title: string; description: string }[] = [];
    if (reportIds.length > 0) {
      const found = await prisma.report.findMany({
        where: { id: { in: reportIds } },
        select: { id: true, title: true, description: true, status: true },
      });

      const missing = reportIds.filter(id => !found.some(f => f.id === id));
      if (missing.length) return NextResponse.json({ error: "Some reports not found", missing }, { status: 404 });

      const ineligible = found.filter(r => r.status !== REQUIRED_STATUS);
      if (ineligible.length) {
        return NextResponse.json({
          error: `Drive can only be created for reports with status ${REQUIRED_STATUS}`,
          ineligible: ineligible.map(r => ({ id: r.id, status: r.status })),
        }, { status: 400 });
      }

      reports = found.map(r => ({ id: r.id, title: r.title, description: r.description }));
    }

    if (!reports.length) {
      return NextResponse.json({ error: "At least one eligible report is required for a drive." }, { status: 400 });
    }

    // --- Parse Dates ---
    const parseDate = (d?: string) => d ? new Date(d) : undefined;
    const startDate = parseDate(body.proposedDate) ?? new Date();
    const endDate = parseDate(body.endDate);

    // --- Participants ---
    const participant = Number.isFinite(Number(body.participant)) ? Number(body.participant) : 0;

    // --- Tasks ---
    // Assign each task to the first linked report
    const tasksData: Prisma.TaskCreateManyDriveInput[] = body.taskBreakdown?.map((task: TaskInput) => ({
      title: task.title,
      description: task.description,
      comfort: task.comfort,
      status: "OPEN",
      reportId: reports[0].id, // required field
    })) ?? [];

    // --- Create Drive ---
    const drive = await prisma.drive.create({
      data: {
        title,
        description: body.description,
        participant,
        startDate,
        endDate,
        reports: { create: reports.map(r => ({
          title: r.title,
          description: r.description,
          report: { connect: { id: r.id } },
        })) },
        tasks: { create: tasksData },
      },
      include: {
        reports: { include: { report: true } },
        votes: true,
        tasks: true,
        beautify: true,
        monitorings: true,
      },
    });

    return NextResponse.json(drive, { status: 201 });
  } catch (err: unknown) {
    console.error("Error creating drive:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error creating drive" }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to create drive" }, { status: 500 });
  }
}

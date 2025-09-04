import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/drives
 * - Returns drives with related reports, votes, tasks, beautify, monitorings
 */
export async function GET(_request: NextRequest) {
  try {
    const drives = await prisma.drive.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reports: { include: { report: true } }, // DriveReport -> report
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

/**
 * POST /api/drives
 * Body:
 * {
 *   title: string,
 *   description?: string,
 *   startDate?: string | Date,
 *   endDate?: string | Date,
 *   participant?: number,
 *   reportId?: string,         // legacy single id
 *   reportIds?: string[]       // preferred array
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
    }

    // Accept either reportId (single) or reportIds (array)
    let reportIds: string[] = [];
    if (Array.isArray(body.reportIds)) {
      reportIds = body.reportIds.filter((id: unknown) => typeof id === "string");
    } else if (typeof body.reportId === "string") {
      reportIds = [body.reportId];
    }

    // Validate reports exist (if provided)
    if (reportIds.length > 0) {
      const found = await prisma.report.findMany({
        where: { id: { in: reportIds } },
        select: { id: true },
      });
      const foundIds = new Set(found.map((r) => r.id));
      const missing = reportIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        return NextResponse.json(
          { error: "Some reportIds were not found", missing },
          { status: 404 }
        );
      }
    }

    // Parse dates
    const parseDate = (d: unknown): Date | undefined => {
      if (!d) return undefined;
      const date = new Date(d as string);
      return isNaN(date.getTime()) ? undefined : date;
    };

    const startDate = parseDate(body.startDate) ?? new Date();
    if (!startDate) {
      return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
    }

    const endDate = parseDate(body.endDate);
    if (body.endDate && !endDate) {
      return NextResponse.json({ error: "Invalid endDate" }, { status: 400 });
    }

    const participant = Number.isFinite(Number(body.participant)) ? Number(body.participant) : 0;

    // Create the drive and link reports via nested create on the Drive.reports relation
    const drive = await prisma.drive.create({
      data: {
        title,
        description: typeof body.description === "string" ? body.description : undefined,
        participant,
        startDate,
        endDate,
        // create DriveReport rows connecting to existing reports
        reports: {
          create:
            reportIds.length > 0
              ? reportIds.map((id) => ({
                  report: { connect: { id } },
                }))
              : [],
        },
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
      // safe to respond with generic message; specific codes could be handled
      return NextResponse.json({ error: "Database error creating drive" }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to create drive" }, { status: 500 });
  }
}

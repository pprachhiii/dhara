import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DiscussionPhase, Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

// POST /api/discussion → add a comment (requires auth)
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { phase, content, reportId, driveId }: {
      phase: DiscussionPhase;
      content: string;
      reportId?: string;
      driveId?: string;
    } = await req.json();

    if (!phase || !content) {
      return NextResponse.json(
        { error: "phase and content are required" },
        { status: 400 }
      );
    }

    if (!Object.values(DiscussionPhase).includes(phase)) {
      return NextResponse.json(
        { error: "Invalid discussion phase" },
        { status: 400 }
      );
    }

    if (!reportId && !driveId) {
      return NextResponse.json(
        { error: "Either reportId or driveId must be provided" },
        { status: 400 }
      );
    }

    // Validate existence of linked entity
    if (reportId) {
      const report = await prisma.report.findUnique({ where: { id: reportId } });
      if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
    }

    if (driveId) {
      const drive = await prisma.drive.findUnique({ where: { id: driveId } });
      if (!drive) {
        return NextResponse.json({ error: "Drive not found" }, { status: 404 });
      }
    }

    // Save discussion
    const discussion = await prisma.discussion.create({
      data: {
        userId: authResult.user.id,
        phase,
        content,
        reportId: reportId ?? null,
        driveId: driveId ?? null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(
      { message: "Comment added", discussion },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error adding discussion:", err);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

// GET /api/discussion?phase=REPORT_VOTING&reportId=xxx OR driveId=xxx
export async function GET(req: NextRequest) {
  try {
    const phaseParam = req.nextUrl.searchParams.get("phase");
    const reportId = req.nextUrl.searchParams.get("reportId");
    const driveId = req.nextUrl.searchParams.get("driveId");

    if (!phaseParam) {
      return NextResponse.json({ error: "phase is required" }, { status: 400 });
    }

    if (!Object.values(DiscussionPhase).includes(phaseParam as DiscussionPhase)) {
      return NextResponse.json(
        { error: "Invalid discussion phase" },
        { status: 400 }
      );
    }

    const where: Prisma.DiscussionWhereInput = {
      phase: phaseParam as DiscussionPhase,
      ...(reportId ? { reportId } : {}),
      ...(driveId ? { driveId } : {}),
    };

    const discussions = await prisma.discussion.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(discussions, { status: 200 });
  } catch (err) {
    console.error("Error fetching discussions:", err);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DiscussionPhase, Prisma} from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

/**
 * POST /api/discussion → create new discussion
 */
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
      return NextResponse.json({ error: "Invalid discussion phase" }, { status: 400 });
    }

    // Phase-specific validations
    if (phase === "REPORT_VOTING") {
      if (!reportId) {
        return NextResponse.json({ error: "reportId required for REPORT_VOTING" }, { status: 400 });
      }
      const report = await prisma.report.findUnique({ where: { id: reportId } });
      if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
      if (report.status !== "ELIGIBLE_FOR_VOTE") {
        return NextResponse.json({ error: "Discussions only allowed when report is ELIGIBLE_FOR_VOTE" }, { status: 400 });
      }
    }

    if (phase === "DRIVE_VOTING") {
      if (!driveId) {
        return NextResponse.json({ error: "driveId required for DRIVE_VOTING" }, { status: 400 });
      }
      const drive = await prisma.drive.findUnique({ where: { id: driveId } });
      if (!drive) return NextResponse.json({ error: "Drive not found" }, { status: 404 });
      if (!["PLANNED", "VOTING_FINALIZED", "ONGOING"].includes(drive.status)) {
        return NextResponse.json({ error: "Discussions only allowed when drive is active or voting" }, { status: 400 });
      }
    }

    // GENERAL → no report/drive required

    const discussion = await prisma.discussion.create({
      data: {
        userId: authResult.user.id,
        phase,
        content,
        reportId: reportId ?? null,
        driveId: driveId ?? null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ message: "Discussion created", discussion }, { status: 201 });
  } catch (err) {
    console.error("Error creating discussion:", err);
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 });
  }
}

/**
 * GET /api/discussion?phase=REPORT_VOTING&reportId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const phaseParam = req.nextUrl.searchParams.get("phase");
    const reportId = req.nextUrl.searchParams.get("reportId");
    const driveId = req.nextUrl.searchParams.get("driveId");

    if (!phaseParam) {
      return NextResponse.json({ error: "phase is required" }, { status: 400 });
    }

    if (!Object.values(DiscussionPhase).includes(phaseParam as DiscussionPhase)) {
      return NextResponse.json({ error: "Invalid discussion phase" }, { status: 400 });
    }

    if (phaseParam === "REPORT_VOTING" && !reportId) {
      return NextResponse.json({ error: "reportId is required for REPORT_VOTING" }, { status: 400 });
    }
    if (phaseParam === "DRIVE_VOTING" && !driveId) {
      return NextResponse.json({ error: "driveId is required for DRIVE_VOTING" }, { status: 400 });
    }

    const where: Prisma.DiscussionWhereInput = {
      phase: phaseParam as DiscussionPhase,
      ...(reportId ? { reportId } : {}),
      ...(driveId ? { driveId } : {}),
    };

    const discussions = await prisma.discussion.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    return NextResponse.json(discussions, { status: 200 });
  } catch (err) {
    console.error("Error fetching discussions:", err);
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 });
  }
}

/**
 * PATCH /api/discussion?id=xxx → update content
 */
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

    const existing = await prisma.discussion.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Discussion not found" }, { status: 404 });

    

    const updated = await prisma.discussion.update({
      where: { id },
      data: { content },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ message: "Discussion updated", discussion: updated }, { status: 200 });
  } catch (err) {
    console.error("Error updating discussion:", err);
    return NextResponse.json({ error: "Failed to update discussion" }, { status: 500 });
  }
}

/**
 * DELETE /api/discussion?id=xxx → delete discussion
 */
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.discussion.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Discussion not found" }, { status: 404 });

    

    await prisma.discussion.delete({ where: { id } });
    return NextResponse.json({ message: "Discussion deleted" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting discussion:", err);
    return NextResponse.json({ error: "Failed to delete discussion" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/serverAuth";

// POST /api/votes/reports
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { reportId } = await req.json();
    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 }
      );
    }

    // Check if user already voted on this report
    const existing = await prisma.vote.findFirst({
      where: { userId: auth.user.id, reportId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already voted on this report" },
        { status: 409 }
      );
    }

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    // If voting hasn't opened, open it now
    if (!report.votingOpenAt) {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          votingOpenAt: now,
          votingCloseAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
          status: "ELIGIBLE_FOR_VOTE",
        },
      });
    }

    // Prevent votes after closing
    if (report.votingCloseAt && now > report.votingCloseAt) {
      return NextResponse.json(
        { error: "Voting for this report has ended" },
        { status: 403 }
      );
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: { userId: auth.user.id, reportId },
    });

    // Count total votes for this report
    const voteCount = await prisma.vote.count({ where: { reportId } });
    const VOTE_THRESHOLD = 3;

    // If threshold is met, update report status
    if (voteCount >= VOTE_THRESHOLD && report.status !== "IN_PROGRESS") {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "IN_PROGRESS", finalVoteCount: voteCount },
      });
    }

    return NextResponse.json(
      { message: "Vote submitted successfully", vote },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}

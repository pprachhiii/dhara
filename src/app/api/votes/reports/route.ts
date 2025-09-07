import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/votes/reports
// Body: { userId: string, reportId: string }
export async function POST(req: NextRequest) {
  try {
    const { userId, reportId } = await req.json();

    if (!userId || !reportId) {
      return NextResponse.json(
        { error: "userId and reportId are required" },
        { status: 400 }
      );
    }

    // ✅ Check if user already voted
    const existing = await prisma.reportVote.findFirst({
      where: { userId, reportId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already voted on this report" },
        { status: 409 }
      );
    }

    // ✅ Fetch report
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const now = new Date();

    // ✅ Initialize voting window if not set
    if (!report.votingOpenAt) {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          votingOpenAt: now,
          votingCloseAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
          status: "ELIGIBLE_DRIVE",
        },
      });
    }

    // ✅ Check if voting window is open
    if (report.votingCloseAt && now > report.votingCloseAt) {
      return NextResponse.json(
        { error: "Voting for this report has ended" },
        { status: 403 }
      );
    }

    // ✅ Create vote
    const vote = await prisma.reportVote.create({
      data: { userId, reportId },
    });

    // ✅ Count votes and check if voting ended
    const voteCount = await prisma.reportVote.count({ where: { reportId } });

    // Optional: Threshold logic to move to IN_PROGRESS
    const VOTE_THRESHOLD = 3; // Example, adjust as needed
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

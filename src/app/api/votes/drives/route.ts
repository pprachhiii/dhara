import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/serverAuth";

// POST /api/votes/drives
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { driveId } = await req.json();
    if (!driveId) {
      return NextResponse.json({ error: "driveId is required" }, { status: 400 });
    }

    // Check if already voted
    const existing = await prisma.vote.findFirst({
      where: { userId: auth.user.id, driveId },
    });
    if (existing) {
      return NextResponse.json({ error: "You already voted for this drive" }, { status: 409 });
    }

    const drive = await prisma.drive.findUnique({ where: { id: driveId } });
    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    const now = new Date();

    // If voting hasn't opened yet
    if (!drive.votingOpenAt) {
      await prisma.drive.update({
        where: { id: driveId },
        data: {
          votingOpenAt: now,
          votingCloseAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          status: "PLANNED", // still valid phase
        },
      });
    }

    // Prevent votes after close
    if (drive.votingCloseAt && now > drive.votingCloseAt) {
      return NextResponse.json({ error: "Voting for this drive has ended" }, { status: 403 });
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: { userId: auth.user.id, driveId },
    });

    // Count total votes
    const voteCount = await prisma.vote.count({ where: { driveId } });
    const VOTE_THRESHOLD = 5; // adjust threshold for drives

    // If threshold met → update status
    if (voteCount >= VOTE_THRESHOLD && drive.status !== "ONGOING") {
      await prisma.drive.update({
        where: { id: driveId },
        data: { status: "ONGOING", finalVoteCount: voteCount },
      });
    }

    return NextResponse.json(
      { message: "Vote submitted successfully", vote },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}

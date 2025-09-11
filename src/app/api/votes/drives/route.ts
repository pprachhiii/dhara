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
      return NextResponse.json(
        { error: "driveId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.driveVote.findFirst({
      where: { userId: auth.user.id, driveId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already voted on this drive" },
        { status: 409 }
      );
    }

    const vote = await prisma.driveVote.create({
      data: { userId: auth.user.id, driveId },
    });

    return NextResponse.json(
      { message: "Vote submitted successfully", vote },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating drive vote:", error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}

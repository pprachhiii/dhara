import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/votes/drives
// Body: { userId: string, driveId: string }
export async function POST(req: NextRequest) {
  try {
    const { userId, driveId } = await req.json();

    if (!userId || !driveId) {
      return NextResponse.json(
        { error: "userId and driveId are required" },
        { status: 400 }
      );
    }

    // ✅ Check if this user already voted on this drive
    const existing = await prisma.vote.findFirst({
      where: { userId, driveId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already voted on this drive" },
        { status: 409 } // Conflict
      );
    }

    const vote = await prisma.vote.create({
      data: { userId, driveId },
    });

    return NextResponse.json(
      { message: "Vote submitted successfully", vote },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}

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

    // ✅ Check if this user already voted on this report
    const existing = await prisma.reportVote.findFirst({
      where: { userId, reportId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already voted on this report" },
        { status: 409 } // Conflict
      );
    }

    const vote = await prisma.reportVote.create({
      data: { userId, reportId },
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

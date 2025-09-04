import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/votes/reports
// Body: { userId: string, reportId: string }
export async function POST(req: NextRequest) {
  try {
    const { userId, reportId } = await req.json();

    if (!userId || !reportId) {
      return NextResponse.json({ error: "userId and reportId are required" }, { status: 400 });
    }

    const vote = await prisma.reportVote.create({
      data: { userId, reportId },
    });

    return NextResponse.json({ message: "Vote submitted successfully", vote }, { status: 201 });
  } catch{
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}

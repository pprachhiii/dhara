import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { DiscussionPhase } from "@prisma/client"

// POST /api/discussion
// Body: { userId: string, phase: "REPORT_VOTING" | "DRIVE_VOTING", content: string }
export async function POST(req: NextRequest) {
  try {
    const { userId, phase, content } = await req.json()

    if (!userId || !phase || !content) {
      return NextResponse.json(
        { error: "userId, phase, and content are required" },
        { status: 400 }
      )
    }

    // Save discussion
    const discussion = await prisma.discussion.create({
      data: { userId, phase, content },
    })

    return NextResponse.json(
      { message: "Comment added", discussion },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    )
  }
}

// GET /api/discussion?phase=REPORT_VOTING
export async function GET(req: NextRequest) {
  try {
    const phase = req.nextUrl.searchParams.get("phase")

    if (!phase) {
      return NextResponse.json(
        { error: "phase is required" },
        { status: 400 }
      )
    }

    const discussions = await prisma.discussion.findMany({
      where: { phase: phase as  DiscussionPhase },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(discussions, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    )
  }
}

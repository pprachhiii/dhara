import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DiscussionPhase } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

// POST /api/discussion → add a comment (requires auth)
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { phase, content } = await req.json();

    if (!phase || !content) {
      return NextResponse.json(
        { error: "phase and content are required" },
        { status: 400 }
      );
    }

    // Save discussion with authenticated user
    const discussion = await prisma.discussion.create({
      data: {
        userId: authResult.user.id,
        phase,
        content,
      },
    });

    return NextResponse.json({ message: "Comment added", discussion }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

// GET /api/discussion?phase=REPORT_VOTING → fetch discussions (public)
export async function GET(req: NextRequest) {
  try {
    const phase = req.nextUrl.searchParams.get("phase");

    if (!phase) {
      return NextResponse.json({ error: "phase is required" }, { status: 400 });
    }

    const discussions = await prisma.discussion.findMany({
      where: { phase: phase as DiscussionPhase },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } }, // optional: show commenter info
    });

    return NextResponse.json(discussions, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 });
  }
}

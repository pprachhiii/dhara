import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { Context } from '@/lib/context';

export async function POST(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) {
    return authResult.response!;
  }

  const userId = authResult.user.id;
  const { id: reportId } = await context.params;

  try {
    // prevent duplicate vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_reportId: {
          userId,
          reportId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this report' },
        { status: 409 },
      );
    }

    await prisma.vote.create({
      data: {
        userId,
        reportId,
      },
    });

    const voteCount = await prisma.vote.count({
      where: { reportId },
    });

    return NextResponse.json({
      success: true,
      voteCount,
    });
  } catch (err) {
    console.error('Vote error:', err);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

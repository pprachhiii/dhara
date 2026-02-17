import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/serverAuth';
import { Context } from '@/lib/context';

export async function POST(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) {
    return authResult.response!;
  }
  const { id } = await context.params;

  try {
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    const discussion = await prisma.discussion.create({
      data: {
        content: content.trim(),
        phase: 'GENERAL',
        driveId: id,
        userId: authResult.user.id,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (error) {
    console.error('Error posting discussion:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}

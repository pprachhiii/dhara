import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/serverAuth';
import { Context } from '@/lib/context';

// POST /api/reports/:id/comment
export async function POST(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) {
    return authResult.response!;
  }

  try {
    const { id: reportId } = await context.params;
    const body = await request.json();

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const discussion = await prisma.discussion.create({
      data: {
        content: body.content.trim(),
        reportId,
        userId: authResult.user.id,
        phase: 'GENERAL',
      },
      include: { user: true },
    });

    return NextResponse.json(discussion);
  } catch (err) {
    console.error('POST comment error:', err);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}

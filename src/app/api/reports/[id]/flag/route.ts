import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { Context } from '@/lib/context';

export async function POST(request: NextRequest, context: Context) {
  const auth = await requireAuth(request);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!body.reason) {
      return NextResponse.json({ error: 'Reason required' }, { status: 400 });
    }

    const flag = await prisma.reportFlag.create({
      data: {
        reportId: id,
        userId: auth.user.id,
        reason: body.reason,
        note: body.note ?? null,
      },
    });

    return NextResponse.json(flag, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to flag report' }, { status: 500 });
  }
}

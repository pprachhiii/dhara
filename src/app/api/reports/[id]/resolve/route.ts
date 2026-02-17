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
    const body = await request.json();
    const {
      resolutionSummary,
      resolvedByAuthority,
      resolutionDate,
      proofImages,
      remainingConcerns,
      remarks,
    } = body;

    if (!resolutionSummary) {
      return NextResponse.json({ error: 'Resolution summary is required' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.reportResolution.create({
        data: {
          reportId,
          resolvedById: userId,
          resolutionSummary,
          resolvedByAuthority: !!resolvedByAuthority,
          resolutionDate: resolutionDate ? new Date(resolutionDate) : new Date(),
          proofImages: proofImages ?? [],
          remainingConcerns: !!remainingConcerns,
          remarks,
        },
      }),

      // 2️⃣ Update report status
      prisma.report.update({
        where: { id: reportId },
        data: { status: 'RESOLVED' },
      }),

      prisma.statusLog.create({
        data: {
          reportId,
          status: 'RESOLVED',
          note: resolutionSummary,
        },
      }),

      prisma.monitoring.updateMany({
        where: {
          reportId,
          status: 'ACTIVE',
        },
        data: {
          status: 'COMPLETED',
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resolve report error:', error);
    return NextResponse.json({ error: 'Failed to resolve report' }, { status: 500 });
  }
}

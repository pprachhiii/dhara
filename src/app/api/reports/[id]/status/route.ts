import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ReportStatus } from '@prisma/client';
import { requireAuth } from '@/lib/serverAuth';
import { Context } from '@/lib/context';

// POST /api/reports/:id/status (protected)
export async function POST(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);

  if (authResult.error || !authResult.user) {
    return authResult.response!;
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !Object.values(ReportStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid report status' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report + create status log atomically
    const updatedReport = await prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id },
        data: { status },
      });

      await tx.statusLog.create({
        data: {
          reportId: id,
          status,
          note: `Status updated to ${status}`,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('POST report status error:', error);
    return NextResponse.json({ error: 'Failed to update report status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReportStatus } from '@prisma/client';
import { subDays } from 'date-fns';

export async function GET(_request: NextRequest) {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: true,
        unifiedVotes: true,
        tasks: true,
        reportAuthorities: true,
        drives: { select: { id: true } },
      },
      orderBy: [{ finalVoteCount: 'desc' }, { createdAt: 'desc' }],
      take: 2,
    });

    const sevenDaysAgo = subDays(new Date(), 7);

    const enrichedReports = reports.map((report) => {
      let finalStatus = report.status;
      const hasDrive = report.drives.length > 0;

      if (hasDrive && report.status === ReportStatus.ELIGIBLE_FOR_DRIVE) {
        finalStatus = ReportStatus.IN_PROGRESS;
      }

      let escalationType: 'CONTACT_AUTHORITY' | 'CREATE_DRIVE' | null = null;
      if (finalStatus === ReportStatus.PENDING) escalationType = 'CONTACT_AUTHORITY';
      if (finalStatus === ReportStatus.AUTHORITY_CONTACTED && report.updatedAt <= sevenDaysAgo) {
        escalationType = 'CREATE_DRIVE';
      }

      return {
        ...report,
        status: finalStatus,
        escalationType,
        voteCount: report.unifiedVotes.length,
      };
    });

    return NextResponse.json(enrichedReports);
  } catch (error) {
    console.error('Featured reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch featured reports' }, { status: 500 });
  }
}

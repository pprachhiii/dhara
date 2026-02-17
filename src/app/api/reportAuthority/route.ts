import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@prisma/client';

// GET /api/reportAuthorities → PUBLIC
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const reportId = url.searchParams.get('reportId');
    const authorityId = url.searchParams.get('authorityId');
    const statusParam = url.searchParams.get('status');

    const status =
      statusParam && Object.values(ContactStatus).includes(statusParam as ContactStatus)
        ? (statusParam as ContactStatus)
        : undefined;

    const records = await prisma.reportAuthority.findMany({
      where: {
        ...(reportId ? { reportId } : {}),
        ...(authorityId ? { authorityId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        report: true,
        authority: true,
      },
    });

    return NextResponse.json(records);
  } catch (err) {
    console.error('Error fetching report-authority records:', err);
    return NextResponse.json(
      { error: 'Failed to fetch report-authority records' },
      { status: 500 },
    );
  }
}

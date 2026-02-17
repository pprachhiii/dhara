import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReportStatus } from '@prisma/client';
import { subDays } from 'date-fns';
import { requireAuth } from '@/lib/serverAuth';

type AuthResponse = {
  error: boolean;
  user?: { id: string; email: string };
  response?: NextResponse;
};

// GET /api/reports (public)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  const status =
    statusParam && Object.values(ReportStatus).includes(statusParam as ReportStatus)
      ? (statusParam as ReportStatus)
      : undefined;

  const reports = await prisma.report.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      reportAuthorities: { include: { authority: true } },
      drives: { include: { drive: true } },
      unifiedVotes: true,
      monitorings: true,
      _count: { select: { unifiedVotes: true } },
    },
  });

  const sevenDaysAgo = subDays(new Date(), 7);

  const enrichedReports = reports.map((report) => {
    const hasDrive = report.drives.length > 0;

    let finalStatus = report.status;

    if (hasDrive && report.status === ReportStatus.ELIGIBLE_FOR_DRIVE) {
      finalStatus = ReportStatus.IN_PROGRESS;
    }

    let escalationType: 'CONTACT_AUTHORITY' | 'CREATE_DRIVE' | null = null;

    if (finalStatus === ReportStatus.PENDING) {
      escalationType = 'CONTACT_AUTHORITY';
    }

    if (finalStatus === ReportStatus.AUTHORITY_CONTACTED && report.updatedAt <= sevenDaysAgo) {
      escalationType = 'CREATE_DRIVE';
    }

    return {
      ...report,
      status: finalStatus,
      escalationType,
      voteCount: report._count.unifiedVotes,
    };
  });

  return NextResponse.json(enrichedReports);
}

// POST /api/reports
export async function POST(request: NextRequest) {
  const authResult = (await requireAuth(request)) as AuthResponse;
  if (authResult.error || !authResult.user) return authResult.response!;

  const data = await request.json();

  const requiredFields = ['title', 'description', 'city', 'country', 'pinCode'];
  for (const field of requiredFields) {
    if (!data[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const newReport = await prisma.report.create({
    data: {
      reporterId: authResult.user.id,
      title: data.title,
      description: data.description,
      status: ReportStatus.PENDING,

      media: data.media ?? [],

      city: data.city,
      region: data.region ?? null,
      country: data.country,
      pinCode: data.pinCode,

      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    },
  });

  return NextResponse.json(newReport, { status: 201 });
}

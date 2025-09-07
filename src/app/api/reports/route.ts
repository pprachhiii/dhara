import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";
import { subDays } from "date-fns";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/reports (public)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const search = url.searchParams.get("search");

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
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      reportAuthorities: { include: { authority: true } },
      drives: { include: { drive: true } },
      votes: true,
      monitorings: true,
      _count: { select: { votes: true } },
    },
  });

  const sevenDaysAgo = subDays(new Date(), 7);

  const enrichedReports = reports.map((report) => {
    let escalationType: "CONTACT_AUTHORITY" | "CREATE_DRIVE" | null = null;

    if (
      report.status === ReportStatus.PENDING ||
      report.status === ReportStatus.ELIGIBLE_AUTHORITY
    ) {
      escalationType = "CONTACT_AUTHORITY";
    }

    if (
      report.status === ReportStatus.AUTHORITY_CONTACTED &&
      report.updatedAt <= sevenDaysAgo
    ) {
      escalationType = "CREATE_DRIVE";
    }

    return {
      ...report,
      escalationType,
      voteCount: report._count.votes,
    };
  });

  return NextResponse.json(enrichedReports);
}

// POST /api/reports (protected)
export async function POST(request: NextRequest) {
  const { error, response, session } = await requireAuth(request);
  if (error || !session) return response;

  const data = await request.json();

  const newReport = await prisma.report.create({
    data: {
      reporterId: session.user.id, // safe now
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      status: ReportStatus.PENDING,
      eligibleAt: new Date(),
    },
  });

  return NextResponse.json(newReport);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";
import { subDays } from "date-fns";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  // Validate ReportStatus
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
      reportAuthorities: {
        include: { authority: true },
      },
      drives: {
        include: { drive: true },
      },
      votes: true,
      monitorings: true,
      _count: { select: { votes: true } },
    },
  });

  const sevenDaysAgo = subDays(new Date(), 7);

  const enrichedReports = reports.map((report) => {
    let escalationType: "CONTACT_AUTHORITY" | "CREATE_DRIVE" | null = null;

    // Contact Authority visible immediately if status is PENDING or ELIGIBLE_AUTHORITY
    if (
      report.status === ReportStatus.PENDING ||
      report.status === ReportStatus.ELIGIBLE_AUTHORITY
    ) {
      escalationType = "CONTACT_AUTHORITY";
    }

    // Escalation: Authority Contacted → Eligible for Drive (only after 7+ days)
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

export async function POST(request: NextRequest) {
  const data = await request.json();
  const newReport = await prisma.report.create({
    data: {
      reporter: data.reporter,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      status: ReportStatus.PENDING,
      eligibleAt: new Date(), // start tracking from creation
    },
  });
  return NextResponse.json(newReport);
}

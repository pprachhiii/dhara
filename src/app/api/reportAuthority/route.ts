import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactStatus } from "@prisma/client";

// GET /api/reportAuthorities
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const reportId = url.searchParams.get("reportId");
    const authorityId = url.searchParams.get("authorityId");
    const statusParam = url.searchParams.get("status");

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
      orderBy: { createdAt: "desc" },
      include: {
        report: true,
        authority: true,
      },
    });

    return NextResponse.json(records);
  } catch (err) {
    console.error("Error fetching report-authority records:", err);
    return NextResponse.json(
      { error: "Failed to fetch report-authority records" },
      { status: 500 }
    );
  }
}

// POST /api/reportAuthorities
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.reportId || !data.authorityId) {
      return NextResponse.json(
        { error: "Missing required fields: reportId, authorityId" },
        { status: 400 }
      );
    }

    // Verify report & authority exist
    const [report, authority] = await Promise.all([
      prisma.report.findUnique({ where: { id: data.reportId } }),
      prisma.authority.findUnique({ where: { id: data.authorityId } }),
    ]);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    if (!authority) {
      return NextResponse.json({ error: "Authority not found" }, { status: 404 });
    }

    // Validate optional status
    let status: ContactStatus = ContactStatus.PENDING;
    if (data.status && Object.values(ContactStatus).includes(data.status)) {
      status = data.status as ContactStatus;
    }

    // Validate contactedAt
    let contactedAt: Date | null = null;
    if (data.contactedAt) {
      const date = new Date(data.contactedAt);
      if (!isNaN(date.getTime())) {
        contactedAt = date;
      }
    }

    const newRecord = await prisma.reportAuthority.create({
      data: {
        reportId: data.reportId,
        authorityId: data.authorityId,
        volunteer: data.volunteer || null,
        status,
        contactedAt,
      },
    });

    return NextResponse.json({
      message: "Report-Authority record created successfully",
      record: newRecord,
    });
  } catch (err) {
    console.error("Error creating report-authority record:", err);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactStatus } from "@prisma/client";

// GET /api/reportAuthorities
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const reportId = url.searchParams.get("reportId");
  const authorityId = url.searchParams.get("authorityId");
  const statusParam = url.searchParams.get("status");

  const status = statusParam && Object.values(ContactStatus).includes(statusParam as ContactStatus)
    ? (statusParam as ContactStatus)
    : undefined;

  try {
    const records = await prisma.reportAuthority.findMany({
      where: {
        ...(reportId ? { reportId } : {}),
        ...(authorityId ? { authorityId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { report: true, authority: true },
    });

    return NextResponse.json(records);
  } catch  {
    return NextResponse.json({ error: "Failed to fetch report-authority records" }, { status: 500 });
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

    const newRecord = await prisma.reportAuthority.create({
      data: {
        reportId: data.reportId,
        authorityId: data.authorityId,
        volunteer: data.volunteer || null,
        status: ContactStatus.PENDING,
        contactedAt: data.contactedAt ? new Date(data.contactedAt) : null,
      },
    });

    return NextResponse.json({ message: "Report-Authority record created successfully", record: newRecord });
  } catch  {
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MonitoringStatus } from "@prisma/client";

// GET /api/monitoring → list all monitorings
export async function GET() {
  try {
    const monitorings = await prisma.monitoring.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        drive: true,
        report: true,
      },
    });

    return NextResponse.json(monitorings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch monitorings" }, { status: 500 });
  }
}

// POST /api/monitoring → start new monitoring
// Body: { driveId?: string, reportId?: string, checkDate: string, notes?: string }
export async function POST(req: NextRequest) {
  try {
    const { driveId, reportId, checkDate, notes } = await req.json();

    if (!checkDate) {
      return NextResponse.json({ error: "checkDate is required" }, { status: 400 });
    }

    const monitoring = await prisma.monitoring.create({
      data: {
        driveId: driveId || null,
        reportId: reportId || null,
        status: MonitoringStatus.ACTIVE,
        checkDate: new Date(checkDate),
        notes: notes || null,
      },
    });

    return NextResponse.json({ message: "Monitoring started successfully", monitoring }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to start monitoring" }, { status: 500 });
  }
}

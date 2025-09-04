import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MonitoringStatus } from "@prisma/client";
import { Context } from "@/lib/context";

// PATCH /api/monitoring/:id → update monitoring
// Body: { notes?: string, status?: MonitoringStatus, checkDate?: string }
export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const updated = await prisma.monitoring.update({
      where: { id },
      data: {
        notes: data.notes ?? undefined,
        status: data.status && Object.values(MonitoringStatus).includes(data.status)
          ? (data.status as MonitoringStatus)
          : undefined,
        checkDate: data.checkDate ? new Date(data.checkDate) : undefined,
      },
    });

    return NextResponse.json({ message: "Monitoring updated", monitoring: updated });
  } catch {
    return NextResponse.json({ error: "Monitoring not found" }, { status: 404 });
  }
}

// DELETE /api/monitoring/:id
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    await prisma.monitoring.delete({ where: { id } });

    return NextResponse.json({ message: "Monitoring deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Monitoring not found" }, { status: 404 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MonitoringStatus } from "@prisma/client";
import { Context } from "@/lib/context";
import { requireAuth } from "@/lib/serverAuth";

// PATCH /api/monitoring/:id → update monitoring
export async function PATCH(request: NextRequest, context: Context) {
  const auth = await requireAuth(request);
  if (auth.error || !auth.user) return auth.response!;

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

// DELETE /api/monitoring/:id → delete monitoring
export async function DELETE(request: NextRequest, context: Context) {
  const auth = await requireAuth(request);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { id } = await context.params;
    await prisma.monitoring.delete({ where: { id } });

    return NextResponse.json({ message: "Monitoring deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Monitoring not found" }, { status: 404 });
  }
}

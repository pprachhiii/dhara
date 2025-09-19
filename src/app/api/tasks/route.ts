import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus, EngagementLevel } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

type AuthResponse = {
  error: boolean;
  user?: { id: string; email: string };
  response?: NextResponse;
};

// GET /api/tasks (public)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const reportId = url.searchParams.get("reportId");
  const statusParam = url.searchParams.get("status");
  const engagementParam = url.searchParams.get("engagement");

  const status =
    statusParam && Object.values(TaskStatus).includes(statusParam as TaskStatus)
      ? (statusParam as TaskStatus)
      : undefined;

  const engagement =
    engagementParam &&
    Object.values(EngagementLevel).includes(engagementParam as EngagementLevel)
      ? (engagementParam as EngagementLevel)
      : undefined;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        reportId: reportId || undefined,
        ...(status ? { status } : {}),
        ...(engagement ? { engagement } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        report: true,
        drive: true,
        volunteer: { include: { user: true } }, // include user for volunteer
      },
    });

    return NextResponse.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/tasks (protected)
export async function POST(req: NextRequest) {
  const authResult = (await requireAuth(req)) as AuthResponse;
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const data = await req.json();

    if (!data.reportId) {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        reportId: data.reportId,
        driveId: data.driveId ?? null,
        volunteerId: data.volunteerId ?? null,
        title: data.title ?? "Untitled Task", // fallback
        description: data.description ?? "No description",
        engagement: data.engagement as EngagementLevel,
        timeSlot: data.timeSlot ? new Date(data.timeSlot) : null,
        status: (data.status as TaskStatus) ?? TaskStatus.OPEN,
      },
      include: {
        report: true,
        drive: true,
        volunteer: { include: { user: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("Error creating task:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

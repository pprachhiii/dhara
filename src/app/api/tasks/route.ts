import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus, SocializingLevel } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

type AuthResponse = {
  error: boolean;
  user?: { id: string; email: string };
  response?: NextResponse;
};

// GET /api/tasks (public)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const comfortParam = url.searchParams.get("comfort");

  const status =
    statusParam && Object.values(TaskStatus).includes(statusParam as TaskStatus)
      ? (statusParam as TaskStatus)
      : undefined;

  const comfort =
    comfortParam &&
    Object.values(SocializingLevel).includes(comfortParam as SocializingLevel)
      ? (comfortParam as SocializingLevel)
      : undefined;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(comfort ? { comfort } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        report: true,
        drive: true,
        volunteer: true,
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
        comfort: data.comfort as SocializingLevel,
        timeSlot: data.timeSlot ? new Date(data.timeSlot) : null,
        status: (data.status as TaskStatus) ?? TaskStatus.OPEN,
      },
      include: {
        report: true,
        drive: true,
        volunteer: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("Error creating task:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}


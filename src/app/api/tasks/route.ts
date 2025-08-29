import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { TaskStatus, SocializingLevel } from "@prisma/client";

// GET /api/tasks
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");   
  const comfortParam = url.searchParams.get("comfort"); 

  // Validate enums
  const status = statusParam && Object.values(TaskStatus).includes(statusParam as TaskStatus)
    ? (statusParam as TaskStatus)
    : undefined;

  const comfort = comfortParam && Object.values(SocializingLevel).includes(comfortParam as SocializingLevel)
    ? (comfortParam as SocializingLevel)
    : undefined;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(comfort ? { comfort } : {}),
      },
      orderBy: { createdAt: "desc" }, // newest first
    });

    return NextResponse.json(tasks);
  } catch{
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}


// POST: Create a new task
export async function POST(req: NextRequest) {
  const data = await req.json();
  const task = await prisma.task.create({ data });
  return NextResponse.json(task, { status: 201 });
}
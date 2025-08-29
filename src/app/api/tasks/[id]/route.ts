import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// GET: Get a single task by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(task);
}

// PATCH: Update a task by ID
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = await req.json();
  const task = await prisma.task.update({ where: { id }, data });
  return NextResponse.json(task);
}

// DELETE: Delete a task by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
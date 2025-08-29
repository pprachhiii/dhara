import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/drives
export async function GET() {
  try {
    const drives = await prisma.drive.findMany({
      orderBy: { createdAt: "desc" }, // newest first
    });
    return NextResponse.json(drives);
  } catch{
    return NextResponse.json({ error: "Failed to fetch drives" }, { status: 500 });
  }
}

// POST /api/drives
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.participant || !data.date || !data.title) {
      return NextResponse.json(
        { error: "Missing required fields: participant, date, title" },
        { status: 400 }
      );
    }

    const newDrive = await prisma.drive.create({
      data: {
        participant: data.participant,
        date: new Date(data.date),
        title: data.title,
        description: data.description || null,
      },
    });

    return NextResponse.json({ message: "Drive created successfully", drive: newDrive });
  } catch{
    return NextResponse.json({ error: "Failed to create drive" }, { status: 500 });
  }
}

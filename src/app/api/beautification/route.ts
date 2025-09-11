import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BeautifyType } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

// POST /api/beautification
// Body: { driveId: string, type: BeautifyType, description?: string }
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { driveId, type, description } = await req.json();

    if (!driveId || !type) {
      return NextResponse.json({ error: "driveId and type are required" }, { status: 400 });
    }

    if (!Object.values(BeautifyType).includes(type)) {
      return NextResponse.json({ error: "Invalid beautification type" }, { status: 400 });
    }

    const beautification = await prisma.beautification.create({
      data: { driveId, type, description },
    });

    return NextResponse.json(
      { message: "Beautification logged successfully", beautification },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to log beautification" }, { status: 500 });
  }
}

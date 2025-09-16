import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EnhancementType } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

// POST /api/enhancements
// Body: { driveId: string, type: EnhancementType, description?: string, referenceUrls?: string[] }
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { driveId, type, description, referenceUrls } = await req.json();

    // Validation
    if (!driveId || !type) {
      return NextResponse.json(
        { error: "driveId and type are required" },
        { status: 400 }
      );
    }

    if (!Object.values(EnhancementType).includes(type)) {
      return NextResponse.json(
        { error: "Invalid enhancement type" },
        { status: 400 }
      );
    }

    // Ensure drive exists
    const drive = await prisma.drive.findUnique({ where: { id: driveId } });
    if (!drive) {
      return NextResponse.json(
        { error: "Drive not found" },
        { status: 404 }
      );
    }

    // Create enhancement
    const enhancement = await prisma.enhancement.create({
      data: {
        driveId,
        type,
        description: description || null,
        referenceUrls: referenceUrls || [],
      },
    });

    return NextResponse.json(
      { message: "Enhancement logged successfully", enhancement },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating enhancement:", error);
    return NextResponse.json(
      { error: "Failed to log enhancement" },
      { status: 500 }
    );
  }
}

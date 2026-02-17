import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/serverAuth';

interface TaskInput {
  title: string;
  description?: string;
  volunteersNeeded: number;
  status?: 'OPEN' | 'ASSIGNED' | 'COMPLETED';
}

interface DriveInput {
  title: string;
  description?: string;
  category: string;

  date: string; // YYYY-MM-DD
  startTime: string;
  durationHr: number;

  participant: number;

  location: {
    area: string;
    wardNumber?: string;
    city: string;
    pinCode?: string;
    directions?: string;
  };

  linkedReportId?: string | null;
  tasks: TaskInput[];

  safetyClassification?: string;
  energyLevel?: number;
  providedItems?: string[];
  volunteerNotes?: string;
  specialNotes?: string;
  maxParticipants?: number;
  meetingPoint?: string;
  areaToCover?: number;
  expectedWasteKg?: number;
  treesToPlant?: number;
}

// ---------------- GET /api/drives ----------------
export async function GET() {
  try {
    const drives = await prisma.drive.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reports: { include: { report: true } },
        tasks: true,
        unifiedVotes: { include: { user: true } },
        enhancements: true,
        monitorings: true,
      },
    });

    return NextResponse.json(drives);
  } catch (err) {
    console.error('Error fetching drives:', err);
    return NextResponse.json({ error: 'Failed to fetch drives' }, { status: 500 });
  }
}

// ---------------- POST /api/drives ----------------
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);

  // Early return if not authenticated
  if (authResult.error || !authResult.user) return authResult.response!;

  const user = authResult.user;

  try {
    const body: DriveInput = await request.json();

    // --- Validation ---
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!body.date || !body.startTime || !body.durationHr) {
      return NextResponse.json({ error: 'Schedule details missing' }, { status: 400 });
    }

    if (!body.location?.area || !body.location?.city) {
      return NextResponse.json({ error: 'Location details missing' }, { status: 400 });
    }

    const drive = await prisma.$transaction(async (tx) => {
      const createdDrive = await tx.drive.create({
        data: {
          title: body.title.trim(),
          description: body.description,
          category: body.category,
          startDate: new Date(body.date),
          startTime: body.startTime,
          durationHr: body.durationHr,
          participant: body.participant,
          area: body.location.area,
          wardNumber: body.location.wardNumber,
          city: body.location.city,
          pinCode: body.location.pinCode,
          directions: body.location.directions,

          safetyClassification: body.safetyClassification,
          energyLevel: body.energyLevel,
          providedItems: body.providedItems ?? [],
          volunteerInstructions: body.volunteerNotes,
          specialNotes: body.specialNotes,
          maxParticipants: body.maxParticipants,
          meetingPoint: body.meetingPoint,
          areaToCover: body.areaToCover,
          expectedWasteKg: body.expectedWasteKg,
          treesToPlant: body.treesToPlant,

          reports: body.linkedReportId ? { create: { reportId: body.linkedReportId } } : undefined,

          tasks: {
            create: body.tasks.map((task) => ({
              title: task.title,
              description: task.description,
              volunteersNeeded: task.volunteersNeeded,
              engagement: 'GROUP',
              status: task.status ?? 'OPEN',
              ...(body.linkedReportId && {
                report: { connect: { id: body.linkedReportId } },
              }),
            })),
          },

          createdById: user.id,
        },
      });

      if (body.linkedReportId) {
        await tx.report.update({
          where: { id: body.linkedReportId },
          data: { status: 'IN_PROGRESS' },
        });
      }

      return createdDrive;
    });

    return NextResponse.json(drive, { status: 201 });
  } catch (err) {
    console.error('Error creating drive:', err);
    return NextResponse.json({ error: 'Failed to create drive' }, { status: 500 });
  }
}

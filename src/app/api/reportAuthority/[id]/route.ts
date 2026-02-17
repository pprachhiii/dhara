import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Context } from '@/lib/context';

// GET /api/reportAuthorities/:id → PUBLIC
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const record = await prisma.reportAuthority.findUnique({
      where: { id },
      include: { report: true, authority: true },
    });

    if (!record) {
      return NextResponse.json({ error: 'Report-Authority record not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error('Error fetching report-authority record:', err);
    return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 });
  }
}

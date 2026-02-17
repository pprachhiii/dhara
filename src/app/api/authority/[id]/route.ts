import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthorityCategory, AuthorityRole, ContactMode } from '@prisma/client';
import { Context } from '@/lib/context';
import { requireAuth } from '@/lib/serverAuth';

export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const authority = await prisma.authority.findUnique({
      where: { id },
      include: { reportAuthorities: { include: { report: true } } },
    });

    if (!authority) {
      return NextResponse.json({ error: 'Authority not found' }, { status: 404 });
    }
    return NextResponse.json(authority);
  } catch (err) {
    console.error('Error fetching authority:', err);
    return NextResponse.json({ error: 'Error fetching authority' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    if (data.category && !Object.values(AuthorityCategory).includes(data.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    if (data.role && !Object.values(AuthorityRole).includes(data.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (data.contactMode && !Object.values(ContactMode).includes(data.contactMode)) {
      return NextResponse.json({ error: 'Invalid contact mode' }, { status: 400 });
    }

    const updated = await prisma.authority.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        role: data.role,
        city: data.city,
        region: data.region ?? null,

        contactMode: data.contactMode,
        email: data.email ?? null,
        phone: data.phone ?? null,
        website: data.website ?? null,
        other: data.other ?? null,

        active: data.active,
      },
    });

    return NextResponse.json({
      message: 'Authority updated successfully',
      authority: updated,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const { id } = await context.params;
    await prisma.authority.delete({ where: { id } });

    return NextResponse.json({ message: 'Authority deleted successfully' });
  } catch (err) {
    console.error('Error deleting authority:', err);
    return NextResponse.json({ error: 'Authority not found' }, { status: 404 });
  }
}

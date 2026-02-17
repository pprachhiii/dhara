import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthorityCategory, AuthorityRole, ContactMode } from '@prisma/client';
import { requireAuth } from '@/lib/serverAuth';

/* -------------------------------- GET -------------------------------- */

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const city = url.searchParams.get('city');
  const region = url.searchParams.get('region');
  const categoryParam = url.searchParams.get('category');
  const roleParam = url.searchParams.get('role');
  const search = url.searchParams.get('search');

  const category =
    categoryParam && Object.values(AuthorityCategory).includes(categoryParam as AuthorityCategory)
      ? (categoryParam as AuthorityCategory)
      : undefined;

  const role =
    roleParam && Object.values(AuthorityRole).includes(roleParam as AuthorityRole)
      ? (roleParam as AuthorityRole)
      : undefined;

  try {
    const authorities = await prisma.authority.findMany({
      where: {
        ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
        ...(region ? { region: { equals: region, mode: 'insensitive' } } : {}),
        ...(category ? { category } : {}),
        ...(role ? { role } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
      include: { reportAuthorities: true },
    });

    return NextResponse.json(authorities);
  } catch (err) {
    console.error('GET /api/authority error:', err);
    return NextResponse.json({ error: 'Failed to fetch authorities' }, { status: 500 });
  }
}

/* -------------------------------- POST -------------------------------- */

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) {
    return authResult.response!;
  }

  try {
    const data = await request.json();

    /* ---------- REQUIRED FIELDS ---------- */
    if (!data.name || !data.category || !data.role || !data.city || !data.contactMode) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, category, role, city, contactMode',
        },
        { status: 400 },
      );
    }

    const category = data.category as AuthorityCategory;
    const role = data.role as AuthorityRole;
    const contactMode = data.contactMode as ContactMode;

    /* ---------- ENUM VALIDATION ---------- */
    if (!Object.values(AuthorityCategory).includes(category)) {
      return NextResponse.json({ error: 'Invalid authority category' }, { status: 400 });
    }

    if (!Object.values(AuthorityRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid authority role' }, { status: 400 });
    }

    if (!Object.values(ContactMode).includes(contactMode)) {
      return NextResponse.json({ error: 'Invalid contact mode' }, { status: 400 });
    }

    /* ---------- CONTACT MODE VALIDATION ---------- */
    const hasValidContact =
      (contactMode === 'EMAIL' && data.email) ||
      (contactMode === 'PHONE' && data.phone) ||
      (contactMode === 'WEBSITE' && data.website) ||
      (contactMode === 'OTHER' && data.other);

    if (!hasValidContact) {
      return NextResponse.json(
        { error: 'Contact value missing for selected contact mode' },
        { status: 400 },
      );
    }

    /* ---------- DUPLICATE CHECK ---------- */
    const exists = await prisma.authority.findFirst({
      where: {
        name: data.name,
        category,
        role,
        city: data.city,
        region: data.region ?? null,
        email: data.email ?? null,
      },
    });

    if (exists) {
      return NextResponse.json({ error: 'Authority already exists' }, { status: 409 });
    }

    /* ---------- CREATE ---------- */
    const authority = await prisma.authority.create({
      data: {
        name: data.name,
        category,
        role,
        city: data.city,
        region: data.region || null,

        contactMode,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        other: data.other || null,

        active: Boolean(data.active),

        submittedById: authResult.user.id,
      },
    });

    return NextResponse.json(
      { message: 'Authority created successfully', authority },
      { status: 201 },
    );
  } catch (err) {
    console.error('POST /api/authority error:', err);
    return NextResponse.json({ error: 'Failed to create authority' }, { status: 500 });
  }
}

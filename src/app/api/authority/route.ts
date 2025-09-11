import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorityType } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/authority → list all authorities (optional: can be public)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");
  const region = url.searchParams.get("region");
  const typeParam = url.searchParams.get("type");
  const search = url.searchParams.get("search");

  const type =
    typeParam && Object.values(AuthorityType).includes(typeParam as AuthorityType)
      ? (typeParam as AuthorityType)
      : undefined;

  try {
    const authorities = await prisma.authority.findMany({
      where: {
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        ...(region ? { region: { equals: region, mode: "insensitive" } } : {}),
        ...(type ? { type } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: [{ city: "asc" }, { name: "asc" }],
      include: {
        reportAuthorities: true,
      },
    });

    return NextResponse.json(authorities);
  } catch (err) {
    console.error("Error in GET /api/authority:", err);
    return NextResponse.json({ error: "Failed to fetch authorities" }, { status: 500 });
  }
}

// POST /api/authority → create new authority (requires auth)
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.error || !authResult.user) return authResult.response!;

  try {
    const data = await request.json();

    if (!data.name || !data.type || !data.city) {
      return NextResponse.json({ error: "Missing required fields: name, type, city" }, { status: 400 });
    }

    const type = data.type as AuthorityType;
    if (!Object.values(AuthorityType).includes(type)) {
      return NextResponse.json({ error: "Invalid authority type" }, { status: 400 });
    }

    const newAuthority = await prisma.authority.create({
      data: {
        name: data.name,
        type,
        city: data.city,
        region: data.region || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        submittedById: authResult.user.id, // track who submitted
      },
    });

    return NextResponse.json({ message: "Authority created successfully", authority: newAuthority }, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/authority:", err);
    return NextResponse.json({ error: "Failed to create authority" }, { status: 500 });
  }
}

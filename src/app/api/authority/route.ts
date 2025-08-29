import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorityType } from "@prisma/client";

// GET /api/authorities
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");
  const region = url.searchParams.get("region");
  const typeParam = url.searchParams.get("type");
  const search = url.searchParams.get("search");

  const type = typeParam && Object.values(AuthorityType).includes(typeParam as AuthorityType)
    ? (typeParam as AuthorityType)
    : undefined;

  const authorities = await prisma.authority.findMany({
    where: {
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
      ...(region ? { region: { equals: region, mode: "insensitive" } } : {}),
      ...(type ? { type } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: [
      { city: "asc" },
      { name: "asc" },
    ],
  });

  return NextResponse.json(authorities);
}

// POST /api/authorities
export async function POST(request: NextRequest) {
  const data = await request.json();

  // Simple validation
  if (!data.name || !data.type || !data.city) {
    return NextResponse.json(
      { error: "Missing required fields: name, type, city" },
      { status: 400 }
    );
  }

  const type = data.type as AuthorityType;
  if (!Object.values(AuthorityType).includes(type)) {
    return NextResponse.json(
      { error: "Invalid authority type" },
      { status: 400 }
    );
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
      submittedBy: data.submittedBy || null,
      active: false, // defaults to false
    },
  });

  return NextResponse.json({ message: "Authority created successfully", authority: newAuthority });
}

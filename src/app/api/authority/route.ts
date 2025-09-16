import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorityCategory, AuthorityRole } from "@prisma/client";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/authority → list all authorities (optional: public)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");
  const region = url.searchParams.get("region");
  const categoryParam = url.searchParams.get("category");
  const roleParam = url.searchParams.get("role");
  const search = url.searchParams.get("search");

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
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        ...(region ? { region: { equals: region, mode: "insensitive" } } : {}),
        ...(category ? { category } : {}),
        ...(role ? { role } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: [{ city: "asc" }, { name: "asc" }],
      include: { reportAuthorities: true },
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

    if (!data.name || !data.category || !data.role || !data.city) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, role, city" },
        { status: 400 }
      );
    }

    const category = data.category as AuthorityCategory;
    const role = data.role as AuthorityRole;

    if (!Object.values(AuthorityCategory).includes(category)) {
      return NextResponse.json({ error: "Invalid authority category" }, { status: 400 });
    }

    if (!Object.values(AuthorityRole).includes(role)) {
      return NextResponse.json({ error: "Invalid authority role" }, { status: 400 });
    }

    const newAuthority = await prisma.authority.create({
      data: {
        name: data.name,
        category,
        role,
        city: data.city,
        region: data.region || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        submittedById: authResult.user.id, // track who submitted
      },
    });

    return NextResponse.json(
      { message: "Authority created successfully", authority: newAuthority },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/authority:", err);
    return NextResponse.json({ error: "Failed to create authority" }, { status: 500 });
  }
}

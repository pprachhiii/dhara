import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorityType } from "@prisma/client";

export async function GET(request: NextRequest) {
  console.log("=== [GET /api/authority] START ===");

  const url = new URL(request.url);
  console.log("Full request URL:", request.url);

  const city = url.searchParams.get("city");
  const region = url.searchParams.get("region");
  const typeParam = url.searchParams.get("type");
  const search = url.searchParams.get("search");

  console.log("Query params =>", {
    city,
    region,
    typeParam,
    search,
  });

  const type =
    typeParam && Object.values(AuthorityType).includes(typeParam as AuthorityType)
      ? (typeParam as AuthorityType)
      : undefined;

  console.log("Parsed type:", type);

  try {
    const authorities = await prisma.authority.findMany({
      where: {
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        ...(region ? { region: { equals: region, mode: "insensitive" } } : {}),
        ...(type ? { type } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: [{ city: "asc" }, { name: "asc" }],
    });

    console.log("Authorities found:", authorities.length);
    console.dir(authorities, { depth: null });

    console.log("=== [GET /api/authority] END ===");
    return NextResponse.json(authorities);
  } catch (err) {
    console.error("Error in GET /api/authority:", err);
    return NextResponse.json({ error: "Failed to fetch authorities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("=== [POST /api/authority] START ===");

  try {
    const data = await request.json();
    console.log("Incoming body:", data);

    // Simple validation
    if (!data.name || !data.type || !data.city) {
      console.warn("Validation failed:", data);
      return NextResponse.json(
        { error: "Missing required fields: name, type, city" },
        { status: 400 }
      );
    }

    const type = data.type as AuthorityType;
    if (!Object.values(AuthorityType).includes(type)) {
      console.warn("Invalid type provided:", type);
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
        submittedBy: data.submittedBy || null,
        active: false, // defaults to false
      },
    });

    console.log("Authority created successfully:", newAuthority);

    console.log("=== [POST /api/authority] END ===");
    return NextResponse.json({
      message: "Authority created successfully",
      authority: newAuthority,
    });
  } catch (err) {
    console.error("Error in POST /api/authority:", err);
    return NextResponse.json({ error: "Failed to create authority" }, { status: 500 });
  }
}

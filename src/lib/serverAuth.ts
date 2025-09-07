import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function requireAuth(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // Return an object with error and NextResponse
    return {
      error: true,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { error: false, session };
}

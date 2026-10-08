import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/kv";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const fid = request.headers.get("x-fid");
  const { type, queryId } = await request.json();

  if (!fid || !type || !queryId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    // Limit how much a single user can influence trending searches
    const allowed = await rateLimit(`search:${fid}`, 30, 60 * 60);
    if (!allowed) {
      return NextResponse.json({ success: false }, { status: 429 });
    }

    await prisma.search.create({
      data: {
        searcherFid: fid.toString(),
        queryId: queryId.toString(),
        type,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track search:", error);
    return NextResponse.json(
      { error: "Failed to track search" },
      { status: 500 }
    );
  }
}

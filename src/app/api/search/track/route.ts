import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verify } from "@/utils/verify";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization") as string;

    const payload = await verify(authHeader);
    const fid = payload.sub;

    const { type, queryId } = await request.json();

    await prisma.search.create({
      data: {
        searcherFid: fid.toString(),
        queryId,
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

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const fid = request.headers.get("x-fid");
  const { type, queryId } = await request.json();

  try {
    await prisma.search.create({
      data: {
        searcherFid: fid!.toString(),
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

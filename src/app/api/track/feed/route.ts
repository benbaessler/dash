import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const fid = Number(request.headers.get("x-fid"));
  const { channelId } = await request.json();

  try {
    await prisma.feedSearch.upsert({
      where: {
        fid_channelId: {
          fid: fid.toString(),
          channelId,
        },
      },
      update: {
        createdAt: new Date(),
      },
      create: {
        fid: fid.toString(),
        channelId,
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

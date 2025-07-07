import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const fid = Number(request.headers.get("x-fid"));
  const { channelId } = await request.json();

  try {
    const savedFeeds = await prisma.savedFeed.findMany({
      where: { fid: fid.toString() },
      orderBy: { createdAt: "asc" },
    });

    if (savedFeeds.length >= 3) {
      // Delete the oldest feed (first in the sorted array)
      await prisma.savedFeed.delete({
        where: { id: savedFeeds[0].id },
      });
    }

    await prisma.savedFeed.create({
      data: {
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

export async function GET(request: NextRequest) {
  const fid = Number(request.headers.get("x-fid"));

  try {
    const savedFeeds = await prisma.savedFeed.findMany({
      where: {
        fid: fid.toString(),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(savedFeeds.map((feed) => `/${feed.channelId}`));
  } catch (error) {
    console.error("Failed to fetch saved feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved feeds" },
      { status: 500 }
    );
  }
}

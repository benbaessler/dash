import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const fid = Number(request.headers.get("x-fid"));

  try {
    let feeds = await prisma.feedSearch.findMany({
      where: {
        fid: fid.toString(),
      },
      select: {
        channelId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 5,
    });

    if (feeds.length < 5) {
      const trendingFeeds = await prisma.feedSearch.groupBy({
        by: ["channelId"],
        _count: {
          channelId: true,
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: {
          _count: {
            channelId: "desc",
          },
        },
        take: 5 - feeds.length,
      });

      feeds = [...feeds, ...trendingFeeds];
    }

    return NextResponse.json([
      ...new Set(feeds.map((feed) => `/${feed.channelId}`)),
    ]);
  } catch (error) {
    console.error("Failed to fetch saved feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved feeds" },
      { status: 500 }
    );
  }
}

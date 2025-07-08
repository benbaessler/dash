import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";

export async function GET(request: Request) {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const trendingQueries = await prisma.search.groupBy({
      by: ["queryId"],
      where: {
        createdAt: {
          gte: weekAgo,
        },
        type: "channel",
      },
      _count: {
        queryId: true,
      },
      orderBy: {
        _count: {
          queryId: "desc",
        },
      },
      take: 3,
    });

    if (trendingQueries.length === 0) {
      return NextResponse.json([]);
    }

    const { channels } = await neynar.fetchBulkChannels({
      ids: trendingQueries.map((item) => item.queryId),
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Failed to fetch trending searches:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending searches" },
      { status: 500 }
    );
  }
}

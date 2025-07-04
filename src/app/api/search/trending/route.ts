import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerFid = Number(searchParams.get("viewerFid")) || undefined;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const trendingQueries = await prisma.search.groupBy({
      by: ["queryId"],
      where: {
        createdAt: {
          gte: weekAgo,
        },
        type: "user",
      },
      _count: {
        queryId: true,
      },
      orderBy: {
        _count: {
          queryId: "desc",
        },
      },
      take: 5,
    });

    if (trendingQueries.length === 0) {
      return NextResponse.json([]);
    }

    const { users } = await neynar.fetchBulkUsers({
      fids: trendingQueries.map((item) => Number(item.queryId)),
      viewerFid,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch trending searches:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending searches" },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { verify } from "@/utils/verify";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") as string;

    const payload = await verify(authHeader);
    const fid = payload.sub;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingQueries = await prisma.search.groupBy({
      by: ["queryId"],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
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

    const { users } = await neynar.fetchBulkUsers({
      fids: trendingQueries.map((item) => Number(item.queryId)),
      viewerFid: Number(fid),
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

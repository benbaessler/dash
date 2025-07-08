import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { convertToVideoData } from "@/utils/convertToVideoData";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const viewerFid = Number(request.headers.get("x-fid"));
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;
  const excludeViewed = searchParams.get("excludeViewed") === "true";

  try {
    const [response, viewedVideos] = await Promise.all([
      neynar.fetchFeedByChannelIds({
        channelIds: [id],
        viewerFid,
        limit: 100,
        cursor,
      }),
      prisma.view.findMany({
        where: {
          viewerFid: viewerFid.toString(),
          channelId: id,
        },
        select: {
          castHash: true,
        },
      }),
    ]);

    let currentResponse = response;
    let data = convertToVideoData(currentResponse.casts, viewedVideos, id);
    let filteredData = data;
    if (excludeViewed) {
      filteredData = data.filter(
        (video) => !viewedVideos.some((view) => view.castHash === video.id)
      );
    }
    let nextCursor = currentResponse.next?.cursor;

    while (data.length > 0 && filteredData.length === 0 && nextCursor) {
      currentResponse = await neynar.fetchFeedByChannelIds({
        channelIds: [id],
        viewerFid,
        limit: 100,
        cursor: nextCursor,
      });
      data = convertToVideoData(currentResponse.casts, viewedVideos, id);
      filteredData = data.filter(
        (video) => !viewedVideos.some((view) => view.castHash === video.id)
      );
      nextCursor = currentResponse.next?.cursor;
    }

    return NextResponse.json({
      data: filteredData,
      cursor: nextCursor,
    });
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel videos" },
      { status: 500 }
    );
  }
}

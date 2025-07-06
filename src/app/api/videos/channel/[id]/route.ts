import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { convertToVideoData } from "@/utils/convertToVideoData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const viewerFid = Number(request.headers.get("x-fid"));
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;

  try {
    const response = await neynar.fetchFeedByChannelIds({
      channelIds: [id],
      viewerFid,
      limit: 100,
      cursor,
    });

    const data = convertToVideoData(response.casts);

    return NextResponse.json({
      data,
      cursor: response.next.cursor,
    });
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel videos" },
      { status: 500 }
    );
  }
}

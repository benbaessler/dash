import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { convertToVideoData } from "@/utils/convertToVideoData";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fid: string }> }
) {
  const { fid } = await params;
  const viewerFid = Number(request.headers.get("x-fid"));
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;

  try {
    const [response, viewedVideos] = await Promise.all([
      neynar.fetchCastsForUser({
        fid: Number(fid),
        viewerFid,
        limit: 150,
        cursor,
        includeReplies: false,
      }),
      prisma.view.findMany({
        where: {
          viewerFid: viewerFid.toString(),
          creatorFid: fid.toString(),
        },
        select: {
          castHash: true,
        },
      }),
    ]);

    const data = convertToVideoData(response.casts, viewedVideos);

    return NextResponse.json({
      data,
      cursor: response.next.cursor,
    });
  } catch (error) {
    console.error("Error fetching user from Neynar:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { convertToVideoData } from "@/utils/convertToVideoData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fid: string }> }
) {
  const { fid } = await params;
  const viewerFid = Number(request.headers.get("x-fid"));
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;

  try {
    const response = await neynar.fetchCastsForUser({
      fid: Number(fid),
      viewerFid,
      limit: 150,
      cursor,
      includeReplies: false,
    });

    const data = convertToVideoData(response.casts);

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

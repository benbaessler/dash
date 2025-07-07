import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const viewerFid = Number(request.headers.get("x-fid"));

  try {
    const response = await neynar.lookupChannel({
      id,
      viewerFid,
    });
    const channel = response.channel;

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }
    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error fetching channel from Neynar:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel data" },
      { status: 500 }
    );
  }
}

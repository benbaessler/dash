import { neynar } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      hash: string;
    }>;
  }
) {
  const { hash } = await params;
  const { searchParams } = new URL(request.url);
  const fid = Number(searchParams.get("fid"));

  if (!hash || !fid) {
    return NextResponse.json({ error: "Missing hash or fid" }, { status: 400 });
  }

  try {
    const { cast } = await neynar.lookupCastByHashOrWarpcastUrl({
      identifier: hash,
      type: "hash",
      viewerFid: fid,
    });

    let videoEmbed: any;

    try {
      videoEmbed = cast.embeds.find(
        (embed: any) =>
          embed.metadata &&
          embed.metadata.content_type === "application/x-mpegurl"
      );
    } catch {}

    const post = {
      id: cast.hash,
      text: cast.text,
      video_url: videoEmbed ? videoEmbed.url : undefined,
      likeCount: cast.reactions.likes_count,
      recastCount: cast.reactions.recasts_count,
      commentCount: cast.replies.count,
      timestamp: cast.timestamp,
      author: {
        fid: cast.author.fid,
        displayName: cast.author.display_name,
        username: cast.author.username,
        pfpUrl: cast.author.pfp_url,
      },
      viewerContext: {
        liked: cast.viewer_context?.liked,
        recasted: cast.viewer_context?.recasted,
      },
    };

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

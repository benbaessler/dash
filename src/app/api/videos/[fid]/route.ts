import { NextResponse } from "next/server";
import { neynar } from "@/lib/neynar";
import { convertISOToUnix } from "@/utils/formatTime";

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

    const castsWithVideo = response.casts.filter(
      (cast) =>
        cast.embeds &&
        cast.embeds.find(
          (embed: any) =>
            embed.metadata &&
            embed.metadata.content_type &&
            embed.metadata.content_type === "application/x-mpegurl"
        )
    );

    const data: VideoData[] = castsWithVideo.map((cast) => {
      const videoEmbed: any = cast.embeds.find(
        (embed: any) =>
          embed.metadata &&
          embed.metadata.content_type &&
          embed.metadata.content_type === "application/x-mpegurl"
      );

      const duration =
        videoEmbed && videoEmbed.metadata && videoEmbed.metadata.video
          ? videoEmbed.metadata.video.duration_s
          : undefined;

      return {
        id: cast.hash,
        text: cast.text,
        video_url: videoEmbed ? videoEmbed.url : undefined,
        duration,
        likeCount: cast.reactions.likes_count,
        recastCount: cast.reactions.recasts_count,
        commentCount: cast.replies.count,
        timestamp: convertISOToUnix(cast.timestamp),
        author: {
          fid: cast.author.fid,
          displayName: cast.author.display_name || "",
          username: cast.author.username,
          pfpUrl: cast.author.pfp_url || "",
        },
        viewerContext: {
          liked: cast.viewer_context?.liked || false,
          recasted: cast.viewer_context?.recasted || false,
        },
      };
    });

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

import { CastWithInteractions } from "@neynar/nodejs-sdk/build/api";
import { convertISOToUnix } from "./formatTime";

export function convertToVideoData(
  casts: CastWithInteractions[],
  channelId?: string,
  views?: { castHash: string }[]
): VideoData[] {
  const castsWithVideo = casts.filter(
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
      channelId,
      text: cast.text,
      video_url: videoEmbed ? videoEmbed.url : undefined,
      duration,
      likeCount: cast.reactions.likes_count,
      recastCount: cast.reactions.recasts_count,
      commentCount: cast.replies.count,
      timestamp: convertISOToUnix(cast.timestamp),
      viewed: views?.some((view) => view.castHash === cast.hash) || false,
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

  return data;
}

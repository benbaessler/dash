import { Metadata } from "next";
import { notFound } from "next/navigation";
import { appUrl, backgroundColor } from "@/constants";
import { neynar } from "@/lib/neynar";

type Props = {
  searchParams: Promise<{
    castHash: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { castHash } = await searchParams;

  const { cast } = await neynar.lookupCastByHashOrWarpcastUrl({
    identifier: castHash,
    type: "hash",
  });

  if (!cast) notFound();

  const isVideo = cast.embeds.some(
    (embed: any) =>
      embed.metadata && embed.metadata.content_type === "application/x-mpegurl"
  );

  if (!isVideo) notFound();

  return {
    title: `Video by @${cast.author.username}`,
    openGraph: {
      title: `Video by @${cast.author.username}`,
      images: [`${appUrl}/api/og/post/${castHash}`],
      description: `Watch a video by @${cast.author.username} on Dash`,
    },
    metadataBase: new URL(appUrl || ""),
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${appUrl}/api/og/post/${castHash}`,
        button: {
          title: "Watch 📲",
          action: {
            type: "launch_frame",
            name: "Dash",
            url: `${appUrl}/v/${castHash}`,
            splashImageUrl: `${appUrl}/splash.png`,
            splashBackgroundColor: backgroundColor,
          },
        },
      }),
    },
  };
}

export default function Page() {
  return "";
}

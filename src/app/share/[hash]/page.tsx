import { Metadata } from "next";
import { notFound } from "next/navigation";
import { appUrl, backgroundColor } from "@/constants";
import { neynar } from "@/lib/neynar";

type Props = {
  params: Promise<{
    hash: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;

  const { cast } = await neynar.lookupCastByHashOrWarpcastUrl({
    identifier: hash,
    type: "hash",
  });

  if (!cast) notFound();

  const isVideo = cast.embeds.some(
    (embed: any) => embed.metadata.content_type === "application/x-mpegurl"
  );

  if (!isVideo) notFound();

  return {
    title: `Video by @${cast.author.username}`,
    openGraph: {
      title: `Video by ${cast.author.username}`,
      images: [`${appUrl}/api/og/post/${hash}`],
      description: `Watch a video by ${cast.author.username} on Dash`,
    },
    metadataBase: new URL(appUrl || ""),
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${appUrl}/api/og/post/${hash}`,
        button: {
          title: "Watch ▶️",
          action: {
            type: "launch_frame",
            name: "Dash",
            url: `${appUrl}/${hash}`,
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

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { appUrl, backgroundColor } from "@/constants";

type Props = {
  params: Promise<{
    handle: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  if (!handle) notFound();

  return {
    title: `${handle} on Dash`,
    openGraph: {
      title: `${handle} on Dash`,
      images: [`${appUrl}/api/og/user/${handle}`],
      description: `View videos from ${handle} on Dash`,
    },
    metadataBase: new URL(appUrl || ""),
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${appUrl}/api/og/user/${handle}`,
        button: {
          title: "View Videos 📲",
          action: {
            type: "launch_frame",
            name: "Dash",
            url: `${appUrl}/u/${handle}`,
            splashImageUrl: `${appUrl}/splash.png`,
            splashBackgroundColor: backgroundColor,
          },
        },
      }),
    },
  };
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

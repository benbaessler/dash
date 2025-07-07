import { Metadata } from "next";
import { notFound } from "next/navigation";
import { appUrl, backgroundColor } from "@/constants";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!id) notFound();

  return {
    title: `/${id} channel on Dash`,
    openGraph: {
      title: `/${id} channel on Dash`,
      images: [`${appUrl}/api/og/channel/${id}`],
      description: `View videos from the /${id} channel on Dash`,
    },
    metadataBase: new URL(appUrl || ""),
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${appUrl}/api/og/channel/${id}`,
        button: {
          title: "View Videos 📲",
          action: {
            type: "launch_frame",
            name: "Dash",
            url: `${appUrl}/c/${id}`,
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

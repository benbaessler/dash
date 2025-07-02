import { Metadata } from "next";
import { appUrl, backgroundColor } from "@/constants";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Dash - Profile`,
    openGraph: {
      title: `Dash - Profile`,
      images: [`${appUrl}/opengraph-image.png`],
      description: `View your videos on Dash`,
    },
    metadataBase: new URL(appUrl || ""),
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${appUrl}/opengraph-image.png`,
        button: {
          title: "View my videos 📲",
          action: {
            type: "launch_frame",
            name: "Dash",
            url: `${appUrl}/profile`,
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

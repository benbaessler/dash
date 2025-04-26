import { Metadata } from "next";
import App from "./app";
import { appUrl } from "@/constants";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Dash",
  openGraph: {
    title: "Dash",
    description: "Explore videos on Farcaster.",
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/opengraph-image.png`,
      button: {
        title: "Launch 📲",
        action: {
          type: "launch_frame",
          name: "Dash",
          url: appUrl,
          splashImageUrl: `${appUrl}/splash.png`,
          iconUrl: `${appUrl}/icon.png`,
          splashBackgroundColor: "#000000",
        },
      },
    }),
  },
};

export default function Home() {
  return <App />;
}

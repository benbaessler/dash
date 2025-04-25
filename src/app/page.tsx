import { Metadata } from "next";
import App from "./app";

export const revalidate = 300;

const appUrl = process.env.NEXT_PUBLIC_URL;

export const metadata: Metadata = {
  title: "Dash",
  openGraph: {
      title: "Dash",
    description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION,
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/opengraph-image.png`,
      button: {
        title: process.env.NEXT_PUBLIC_FRAME_BUTTON_TEXT,
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

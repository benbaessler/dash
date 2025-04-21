import type { Metadata } from "next";

import { getSession } from "~/auth";
import "~/app/globals.css";
import "@vidstack/react/player/styles/base.css";
import { Providers } from "~/app/providers";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_FRAME_NAME || "Frames v2 Demo",
  description:
    process.env.NEXT_PUBLIC_FRAME_DESCRIPTION ||
    "A Farcaster Frames v2 demo app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body lang="en" className={dmSans.variable}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}

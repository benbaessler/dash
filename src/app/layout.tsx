import type { Metadata } from "next";

import { getSession } from "@/auth";
import "@/app/globals.css";
import "@vidstack/react/player/styles/base.css";
import { Providers } from "@/app/providers";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

if (!process.env.NEXT_PUBLIC_FRAME_NAME || !process.env.NEXT_PUBLIC_FRAME_DESCRIPTION) {
  throw new Error("NEXT_PUBLIC_FRAME_NAME and NEXT_PUBLIC_FRAME_DESCRIPTION must be set");
}

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_FRAME_NAME,
  description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION,
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

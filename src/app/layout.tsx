import type { Metadata } from "next";

import { getSession } from "@/auth";
import "@/app/globals.css";
import "@vidstack/react/player/styles/base.css";
import { Providers } from "@/app/providers";
import { DM_Sans } from "next/font/google";
import { backgroundColor } from "@/constants";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Dash",
  description: "Explore videos on Farcaster.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en" className={`bg-[${backgroundColor}]`}>
      <body lang="en" className={`${dmSans.variable} bg-${backgroundColor}`}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}

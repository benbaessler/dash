import type { Metadata } from "next";

import { getSession } from "@/auth";
import "@/app/globals.css";
import "@vidstack/react/player/styles/base.css";
import { Providers } from "@/app/providers";
import { Inter } from "next/font/google";
import { backgroundColor } from "@/constants";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body lang="en" className={`${inter.variable} bg-${backgroundColor}`}>
        <Providers session={session}>{children}</Providers>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}

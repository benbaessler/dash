"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { FrameProvider } from "@/providers/FrameProvider";
import { SignerProvider } from "@/providers/SignerProvider";
import PlausibleProvider from "next-plausible";
import { appDomain } from "@/constants";
import { PostHogProvider } from "@/providers/PostHogProvider";

export function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  if (!appDomain) throw new Error("NEXT_PUBLIC_DOMAIN is not set");

  return (
    <PostHogProvider>
      <PlausibleProvider domain={appDomain}>
        <SessionProvider session={session}>
          <FrameProvider>
            <SignerProvider>{children}</SignerProvider>
          </FrameProvider>
        </SessionProvider>
      </PlausibleProvider>
    </PostHogProvider>
  );
}
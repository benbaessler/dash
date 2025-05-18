"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { FrameProvider } from "@/providers/FrameProvider";
import { SignerProvider } from "@/providers/SignerProvider";
import PlausibleProvider from "next-plausible";
import { appDomain } from "@/constants";

export function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  if (!appDomain) throw new Error("NEXT_PUBLIC_DOMAIN is not set");

  return (
    <PlausibleProvider domain={appDomain}>
      <SessionProvider session={session}>
        <FrameProvider>
          <SignerProvider>{children}</SignerProvider>
        </FrameProvider>
      </SessionProvider>
    </PlausibleProvider>
  );
}

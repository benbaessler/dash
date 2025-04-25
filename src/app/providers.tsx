"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { FrameProvider } from "@/providers/FrameProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import { SignerProvider } from "@/providers/SignerProvider";

export function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        disableTransitionOnChange
      >
        <FrameProvider>
          <SignerProvider>{children}</SignerProvider>
        </FrameProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

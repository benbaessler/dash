"use client";

import { FrameProvider } from "@/providers/FrameProvider";
import { SignerProvider } from "@/providers/SignerProvider";
import { appDomain } from "@/constants";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { App } from "./app";
import { Suspense } from "react";
import { NotFound } from "./components/common/not-found";

export function Providers({ children }: { children: React.ReactNode }) {
  if (!appDomain) throw new Error("NEXT_PUBLIC_DOMAIN is not set");

  return (
    <PostHogProvider>
      <FrameProvider>
        <SignerProvider>
          <Suspense fallback={<NotFound />}>
            <App>{children}</App>
          </Suspense>
        </SignerProvider>
      </FrameProvider>
    </PostHogProvider>
  );
}

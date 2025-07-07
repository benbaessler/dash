"use client";

import { FrameProvider } from "@/providers/FrameProvider";
import { SignerProvider } from "@/providers/SignerProvider";
import { appDomain } from "@/constants";
import { PostHogProvider } from "@/providers/PostHogProvider";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { NotFound } from "./components/common/not-found";
import { Loading } from "./components/common/loading";
import { NavigationProvider } from "@/providers/NavigationProvider";

const App = dynamic(
  () => import("./app").then((mod) => ({ default: mod.App })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  if (!appDomain) throw new Error("NEXT_PUBLIC_DOMAIN is not set");

  return (
    <PostHogProvider>
      <FrameProvider>
        <SignerProvider>
          <NavigationProvider>
            <Suspense fallback={<NotFound />}>
              <App>{children}</App>
            </Suspense>
          </NavigationProvider>
        </SignerProvider>
      </FrameProvider>
    </PostHogProvider>
  );
}

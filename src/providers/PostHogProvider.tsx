"use client";

import { isDevelopment } from "@/constants";
import dynamic from "next/dynamic";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";

const PostHogPageView = dynamic(() => import("@/components/posthog-pageview"), {
  ssr: false,
});

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      person_profiles: "identified_only",
      capture_pageview: false, // Disabled since we capture manually
      capture_pageleave: true,
      debug: isDevelopment,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}

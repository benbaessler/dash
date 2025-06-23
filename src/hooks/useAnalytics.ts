import { isDevelopment } from "@/constants";
import { UserContext } from "@farcaster/frame-core/dist/context";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

/**
 * Hook for centralized analytics functionality
 */
export function useAnalytics() {
  const posthog = usePostHog();
  const [hasIdentified, setHasIdentified] = useState(false);

  /**
   * Identify a user in PostHog
   */
  const identifyUser = (user: UserContext) => {
    if (!posthog?.__loaded || !user?.fid || hasIdentified) {
      return false;
    }

    // Collect all relevant user properties
    const userProperties = {
      fid: user.fid,
      username: user.username,
      display_name: user.displayName,
      profile_picture: user.pfpUrl,
      identified_at: new Date().toISOString(),
    };

    // Identify user in PostHog
    posthog.identify(user.fid.toString(), userProperties);
    setHasIdentified(true);

    return true;
  };

  /**
   * Reset PostHog identification
   */
  const resetIdentity = () => {
    if (posthog?.__loaded) {
      posthog.reset();
      setHasIdentified(false);
    }
  };

  /**
   * Track an event in PostHog
   */
  const trackEvent = (
    eventName: string,
    properties?: Record<string, unknown>,
    user?: UserContext
  ) => {
    if (!posthog?.__loaded) return;

    posthog.capture(eventName, {
      ...properties,
      environment: isDevelopment ? "development" : "production",
      ...(user?.fid && { fid: user.fid }),
    });
  };

  /**
   * Track an error in PostHog
   */
  const trackError = (error: Error, context?: Record<string, unknown>) => {
    if (!posthog?.__loaded) return;

    posthog.captureException(error, {
      ...context,
      environment: isDevelopment ? "development" : "production",
    });
  };

  return {
    identifyUser,
    resetIdentity,
    trackEvent,
    trackError,
    isIdentified: hasIdentified,
  };
}

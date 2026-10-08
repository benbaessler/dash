"use client";

import { useEffect, useState, useCallback, useContext } from "react";
import sdk, {
  type Context,
  type FrameNotificationDetails,
} from "@farcaster/frame-sdk";
import React from "react";
import useSWR, { SWRResponse } from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { useAnalytics } from "@/hooks/useAnalytics";
import { fetcher } from "@/utils/fetcher";

interface FrameContextType {
  isSDKLoaded: boolean;
  context: Context.FrameContext | undefined;
  added: boolean;
  notificationDetails: FrameNotificationDetails | null;
  sessionToken: string | null;
  signIn: () => Promise<string | null>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  user: User | undefined;
  userError: Error | undefined;
  userLoading: boolean;
}

const FrameContext = React.createContext<FrameContextType | undefined>(
  undefined
);

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [added, setAdded] = useState(false);
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { identifyUser } = useAnalytics();
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const fid = context?.user?.fid;

  const {
    data: user,
    error: userError,
    isLoading: userLoading,
  }: SWRResponse<User> = useSWR(
    sessionToken && fid ? `/api/user/${fid}` : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  const addFrame = useCallback(async () => {
    setNotificationDetails(null);

    const result = await sdk.actions.addFrame();

    if (result.notificationDetails) {
      setNotificationDetails(result.notificationDetails);
    }
  }, []);

  const signIn = useCallback(async () => {
    if (sessionToken) return sessionToken;

    const { token } = await sdk.experimental.quickAuth();

    setSessionToken(token);
    return token;
  }, [sessionToken]);

  useEffect(() => {
    const load = async () => {
      const token = await signIn();
      const context = await sdk.context;
      setContext(context);
      setIsSDKLoaded(true);

      sdk.on("frameAdded", async ({ notificationDetails }) => {
        setAdded(true);
        setNotificationDetails(notificationDetails ?? null);

        if (!token) return;
        try {
          await fetch("/api/onboard", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error("Error onboarding user", error);
        }
      });

      sdk.actions.ready({});
      identifyUser(context.user);
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, identifyUser, signIn]);

  const values = {
    isSDKLoaded,
    context,
    added,
    notificationDetails,
    addFrame,
    sessionToken,
    fid,
    user,
    userError,
    userLoading,
    signIn,
    loading,
    setLoading,
  };

  return (
    <FrameContext.Provider value={values}>{children}</FrameContext.Provider>
  );
}

export function useFrame() {
  const context = useContext(FrameContext);
  if (context === undefined) {
    throw new Error("useFrame must be used within a FrameProvider");
  }
  return context;
}

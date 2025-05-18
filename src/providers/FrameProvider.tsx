"use client";

import { useEffect, useState, useCallback, useContext } from "react";
import sdk, {
  type Context,
  type FrameNotificationDetails,
  AddFrame,
} from "@farcaster/frame-sdk";
import React from "react";
import { getCsrfToken } from "next-auth/react";
import { isMobile } from "@/utils/isMobile";
import useSWR, { SWRResponse } from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { onboardUser } from "@/utils/onboarding";

interface FrameContextType {
  isSDKLoaded: boolean;
  context: Context.FrameContext | undefined;
  added: boolean;
  notificationDetails: FrameNotificationDetails | null;
  lastEvent: string;
  addFrameResult: string;
  sessionToken: string | null;
  mobile: boolean;
  signIn: () => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  user: User | undefined;
  userError: Error | undefined;
  userLoading: boolean;
}

const FrameContext = React.createContext<FrameContextType | undefined>(
  undefined
);

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }
    return res.json();
  });

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [added, setAdded] = useState(false);
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);
  const [lastEvent, setLastEvent] = useState("");
  const [addFrameResult, setAddFrameResult] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [mobile, setMobile] = useState<boolean>(false);

  const fid = context?.user?.fid;

  const {
    data: user,
    error: userError,
    isLoading: userLoading,
  }: SWRResponse<User> = useSWR(fid ? `/api/user/${fid}` : null, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    errorRetryCount: 3,
  });

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : "Added, got no notification details"
      );
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  const signIn = useCallback(async () => {
    if (sessionToken) return;

    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    const result = await sdk.actions.signIn({ nonce });
    const response = await fetch("api/verify", {
      method: "POST",
      body: JSON.stringify({
        message: result.message,
        signature: result.signature,
        nonce,
      }),
    });

    const { success, token } = await response.json();

    if (!success) throw new Error("Failed to sign in");

    setSessionToken(token);
  }, []);

  useEffect(() => {
    const triggerSignInOnMobile = async () => {
      const mobile = await isMobile();
      setMobile(mobile);
      if (mobile) await signIn();
    };

    if (!sessionToken) {
      triggerSignInOnMobile();
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      setIsSDKLoaded(true);

      sdk.on("notificationsEnabled", async ({ notificationDetails }) => {
        setAdded(true);
        setNotificationDetails(notificationDetails ?? null);

        if (context.user?.fid) await onboardUser(context.user.fid);
      });

      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const values = {
    isSDKLoaded,
    context,
    added,
    notificationDetails,
    lastEvent,
    addFrame,
    addFrameResult,
    sessionToken,
    fid,
    user,
    userError,
    userLoading,
    mobile,
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

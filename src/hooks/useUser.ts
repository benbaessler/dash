import { useEffect } from "react";

import { useState } from "react";
import { User } from "@neynar/nodejs-sdk/build/api";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import sdk from "@farcaster/frame-sdk";

interface FarcasterUser {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
}

export const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(
    null
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData && storedData !== "undefined") {
      console.log({ storedData });
      const user: FarcasterUser = JSON.parse(storedData);
      setFarcasterUser(user);
    }
  }, []);

  useEffect(() => {
    if (farcasterUser && farcasterUser.status === "pending_approval") {
      let intervalId: NodeJS.Timeout;

      const startPolling = () => {
        intervalId = setInterval(async () => {
          try {
            const response = await fetch(
              `/api/signer?signer_uuid=${farcasterUser?.signer_uuid}`
            );
            const data = await response.json();
            const user = data as FarcasterUser;

            if (user?.status === "approved") {
              // store the user in local storage
              localStorage.setItem(
                LOCAL_STORAGE_KEYS.FARCASTER_USER,
                JSON.stringify(user)
              );

              setFarcasterUser(user);
              clearInterval(intervalId);
            }
          } catch (error) {
            console.error("Error during polling", error);
          }
        }, 2000);
      };

      const stopPolling = () => {
        clearInterval(intervalId);
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Start the polling when the effect runs.
      startPolling();

      // Cleanup function to remove the event listener and clear interval.
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        clearInterval(intervalId);
      };
    }
  }, [farcasterUser]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/user?fid=${farcasterUser?.fid}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Could not fetch the user", error);
    }
  };

  useEffect(() => {
    if (farcasterUser?.status === "approved") {
      fetchUser();
    }
  }, [farcasterUser]);

  async function createAndStoreSigner() {
    try {
      const response = await fetch("/api/signer", {
        method: "POST",
      });
      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.FARCASTER_USER,
          JSON.stringify(data)
        );
        setFarcasterUser(data);

        await sdk.actions.openUrl(data.signer_approval_url);
      }
    } catch (error) {
      console.error("API Call failed", error);
    }
  }

  async function handleSignIn() {
    setLoading(true);
    await createAndStoreSigner();
    setLoading(false);
  }

  return {
    farcasterUser,
    user,
    handleSignIn,
    loading,
  };
};

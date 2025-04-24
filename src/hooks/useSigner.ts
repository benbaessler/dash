import { useEffect, useRef } from "react";

import { useState } from "react";
import { User } from "@neynar/nodejs-sdk/build/api";
import { LOCAL_STORAGE_KEYS } from "@/constants";

interface Signer {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
}

export const useSigner = () => {
  const [signer, setSigner] = useState<Signer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData && storedData !== "undefined") {
      const updateSigner = async (signer_uuid: string) => {
        const response = await fetch(`/api/signer?signer_uuid=${signer_uuid}`);
        const data = await response.json();
        if (data.status === "revoked") {
          localStorage.removeItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
          setSigner(null);
        } else {
          setSigner(data as Signer);
        }
      };

      const user: Signer = JSON.parse(storedData);
      updateSigner(user.signer_uuid);
    }
  }, []);

  const startPolling = () => {
    console.log("Starting polling");
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/signer?signer_uuid=${signer?.signer_uuid}`
        );
        const data = await response.json();
        const user = data as Signer;

        if (user?.status === "approved") {
          // store the user in local storage
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.FARCASTER_USER,
            JSON.stringify(user)
          );

          setSigner(user);
          clearInterval(intervalRef.current);
        }
      } catch (error) {
        console.error("Error during polling", error);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      console.log("Stopped polling");
    }
  };

  useEffect(() => {
    if (signer && signer.status === "revoked") {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
      setSigner(null);
    }
  }, [signer]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/user?fid=${signer?.fid}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Could not fetch the user", error);
    }
  };

  useEffect(() => {
    if (signer?.status === "approved") {
      fetchUser();
    }
  }, [signer]);

  async function createSigner() {
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
        setSigner(data);
        startPolling();

        // await sdk.actions.openUrl(data.signer_approval_url);
      }
    } catch (error) {
      console.error("API Call failed", error);
    }
  }

  return {
    signer,
    user,
    createSigner,
    startPolling,
    stopPolling,
  };
};

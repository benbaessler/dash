import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Signer } from "@neynar/nodejs-sdk/build/api";
import { useFrame } from "@/providers/FrameProvider";

interface SignerContextType {
  signer: Signer | null;
  createSigner: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

const SignerContext = createContext<SignerContextType | undefined>(undefined);

export const SignerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSDKLoaded, context } = useFrame();
  const [signer, setSigner] = useState<Signer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fid = context?.user.fid;

  useEffect(() => {
    if (!isSDKLoaded || !context) return;

    const checkSigner = async () => {
      try {
        let response = await fetch(`/api/user/${fid}`);
        const { dbUser } = await response.json();

        response = await fetch(`/api/signer?signer_uuid=${dbUser.signerUuid}`);
        const signerData = await response.json();

        if (signerData.status === "revoked") {
          console.log("Signer revoked");
          setSigner(null);
        } else {
          console.log({ signerData });
          setSigner(signerData);
        }
      } catch {}
    };

    checkSigner();
  }, [isSDKLoaded, context]);

  const startPolling = () => {
    console.log("Starting polling", { signer });
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/signer?signer_uuid=${signer?.signer_uuid}`);
        const data = await response.json();

        if (data.status === "approved") {
          clearInterval(intervalRef.current);
          setSigner(data);
          await storeUser(data);
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

  async function createSigner() {
    try {
      const response = await fetch("/api/signer", {
        method: "POST",
      });
      const data = await response.json();
      setSigner(data);
    } catch (error) {
      console.error("API Call failed", error);
    }
  }

  const signerValue = {
    signer,
    createSigner,
    startPolling,
    stopPolling,
  };
  
  return (
    <SignerContext.Provider value={signerValue}>
      {children}
    </SignerContext.Provider>
  );
};

const storeUser = async (data: Signer) => {
  try {
    const response = await fetch(`/api/user/${data.fid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expiresAt: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year from now
        signerUuid: data.signer_uuid,
        publicKey: data.public_key,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to store signer in database");
    }
  } catch (error) {
    console.error("Error storing signer in database:", error);
  }
};

export const useSigner = (): SignerContextType => {
  const context = useContext(SignerContext);
  
  if (context === undefined) {
    throw new Error("useSignerContext must be used within a SignerProvider");
  }
  
  return context;
};
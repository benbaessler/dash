import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Signer } from "@neynar/nodejs-sdk/build/api";
import { useFrame } from "@/providers/FrameProvider";

interface SignerContextType {
  valid: boolean;
  signer: Signer | null;
  verifySigner: () => Promise<boolean>;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  createSigner: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  loading: boolean;
}

const SignerContext = createContext<SignerContextType | undefined>(undefined);

export const SignerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isSDKLoaded, context, sessionToken, signIn } = useFrame();
  const [signer, setSigner] = useState<Signer | null>(null);
  const [valid, setValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fid = context?.user?.fid;

  useEffect(() => {
    if (!isSDKLoaded || !context) return;

    const checkSigner = async () => {
      const response = await fetch(`/api/verify/signer?fid=${fid}`);
      const { verified } = await response.json();
      setValid(verified);
    };

    checkSigner();
  }, [isSDKLoaded, context, fid]);

  const startPolling = () => {
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/signer?signer_uuid=${signer?.signer_uuid}`
        );
        const data = await response.json();

        if (data.status === "approved") {
          clearInterval(intervalRef.current);
          setValid(true);
          setSigner(null);
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
      setLoading(false);
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

  const storeUser = async (data: Signer) => {
    try {
      const response = await fetch(`/api/verify/signer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
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

  const verifySigner = async () => {
    if (!sessionToken) {
      try {
        await signIn();
      } catch (error) {
        console.error("Failed to sign in", error);
      }
      return false;
    }

    if (loading) return false;
    if (!valid) {
      if (!signer) {
        setLoading(true);
        await createSigner();
      }
      setShowDialog(true);
      return false;
    }
    return true;
  };

  const signerValue = {
    valid,
    verifySigner,
    signer,
    createSigner,
    startPolling,
    stopPolling,
    loading,
    showDialog,
    setShowDialog,
  };

  return (
    <SignerContext.Provider value={signerValue}>
      {children}
    </SignerContext.Provider>
  );
};

export const useSigner = (): SignerContextType => {
  const context = useContext(SignerContext);

  if (context === undefined) {
    throw new Error("useSignerContext must be used within a SignerProvider");
  }

  return context;
};

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Signer, User } from "@neynar/nodejs-sdk/build/api";
import { useFrame } from "@/providers/FrameProvider";
import useSWR, { SWRResponse, useSWRConfig } from "swr";

interface SignerContextType {
  valid: boolean;
  signer: Signer | null;
  createSigner: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  loading: boolean;
  user: User | null | undefined;
  userLoading: boolean;
  userError: Error | undefined;
}

const SignerContext = createContext<SignerContextType | undefined>(undefined);

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }
    return res.json();
  });

export const SignerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isSDKLoaded, context, sessionToken } = useFrame();
  const [signer, setSigner] = useState<Signer | null>(null);
  const [valid, setValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { mutate } = useSWRConfig();

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

  useEffect(() => {
    if (!isSDKLoaded || !context) return;

    const checkSigner = async () => {
      const response = await fetch(`/api/verify/signer/${fid}`);
      const { verified } = await response.json();
      setValid(verified);
    };

    checkSigner();
    setLoading(false);
  }, [isSDKLoaded, context]);

  const startPolling = () => {
    console.log("Starting polling", { signer });
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
          if (data.fid) {
            mutate(`/api/user/${data.fid}`);
          }
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

  const storeUser = async (data: Signer) => {
    try {
      const response = await fetch(`/api/verify/signer/${data.fid}`, {
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

  const signerValue = {
    valid,
    signer,
    createSigner,
    startPolling,
    stopPolling,
    loading,
    user,
    userLoading,
    userError,
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

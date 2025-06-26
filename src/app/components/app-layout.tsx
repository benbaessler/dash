"use client";

import { ReactNode, useEffect } from "react";
import { Navbar } from "./navbar";
import { ConnectSignerDialog } from "./dialogs/connect-signer";
import { useSigner } from "@/providers/SignerProvider";
import { useFrame } from "@/providers/FrameProvider";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { showDialog, setShowDialog } = useSigner();
  const { sessionToken, signIn } = useFrame();

  useEffect(() => {
    if (!sessionToken) signIn();
  }, [sessionToken, signIn]);

  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
        <Navbar />
      </div>
      <ConnectSignerDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
} 
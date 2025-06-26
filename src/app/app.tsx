"use client";
import { useFrame } from "@/providers/FrameProvider";
import { useEffect } from "react";
// import { ProfileStack } from "./components/profile-stack";
import { Navbar } from "./components/navbar";
import { useSigner } from "@/providers/SignerProvider";
import { ConnectSignerDialog } from "./components/dialogs/connect-signer";
import { FeedView } from "./components/feed";

export default function App() {
  const { sessionToken, signIn } = useFrame();
  const { showDialog, setShowDialog } = useSigner();

  useEffect(() => {
    if (!sessionToken) signIn();
  }, [sessionToken, signIn]);

  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        <FeedView />
        {/* <Navbar /> */}
        {/* <ProfileStack /> */}
      </div>
      <ConnectSignerDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}

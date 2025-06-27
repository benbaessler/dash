"use client";

import { ReactNode, useEffect, useState } from "react";
import { Navbar } from "./components/navbar";
import { ConnectSignerDialog } from "./components/dialogs/connect-signer";
import { useSigner } from "@/providers/SignerProvider";
import { useFrame } from "@/providers/FrameProvider";
import { usePathname } from "next/navigation";
import { Profile } from "./components/profile";
import { FeedView } from "./components/feed";

interface Props {
  children?: ReactNode;
}

export function AppLayout({ children }: Props) {
  const { showDialog, setShowDialog } = useSigner();
  const { sessionToken, signIn, user } = useFrame();
  const pathname = usePathname();

  const initialTab = () => {
    if (pathname === "/profile") return "profile";
    if (pathname === "/") return "home";
    if (pathname === `/${user?.username}`) return "profile";
    return null;
  };

  const [selectedTab, setSelectedTab] = useState<"home" | "profile" | null>(
    initialTab()
  );

  useEffect(() => {
    if (!sessionToken) signIn();
  }, [sessionToken, signIn]);

  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <FeedView idle={selectedTab === "profile"} />
          {selectedTab === "profile" && (
            <div className="fixed inset-0 bg-black z-[10]">
              <Profile user={user || null} isCurrentUser />
            </div>
          )}
          {selectedTab === null && children}
        </div>
        <Navbar selected={selectedTab} onTabChange={setSelectedTab} />
      </div>
      <ConnectSignerDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}

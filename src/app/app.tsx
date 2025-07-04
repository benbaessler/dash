"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/navbar";
import { ConnectSignerDialog } from "./components/dialogs/connect-signer";
import { useSigner } from "@/providers/SignerProvider";
import { useFrame } from "@/providers/FrameProvider";
import { usePathname, useSearchParams } from "next/navigation";
import { Profile } from "./components/profile";
import { FeedView } from "./components/feed";
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast";

interface Props {
  children?: ReactNode;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Video not found");
  }
  const { data } = await response.json();
  return data;
};

export function App({ children }: Props) {
  const { showDialog, setShowDialog } = useSigner();
  const { sessionToken, signIn, user, context } = useFrame();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const hash = pathname.startsWith("/v")
    ? searchParams.get("castHash")
    : undefined;

  const { data: videoData, error } = useSWR<VideoData>(
    hash && context?.user.fid
      ? `/api/post/${hash}?fid=${context.user.fid}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const initialTab = useMemo(() => {
    if (pathname === "/profile") return "profile";
    if (pathname === "/" || pathname.startsWith("/v")) return "home";
    if (pathname === `/u/${user?.username}`) return "profile";
    return null;
  }, [pathname, user?.username]);

  const [selectedTab, setSelectedTab] = useState<Tab | null>(
    initialTab
  );

  useEffect(() => {
    setSelectedTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!sessionToken) signIn();
  }, [sessionToken, signIn]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Video not found",
        description: "The linked cast could not be found",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (videoData && !videoData.video_url) {
      toast({
        title: "Not a video",
        description: "The linked cast is not a video",
      });
    }
  }, [videoData, toast]);

  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <motion.div
            className="absolute inset-0"
            animate={{
              x: selectedTab === "profile" ? "-50%" : "0%",
              opacity: selectedTab === "profile" ? 0 : 1,
            }}
            transition={{
              type: "tween",
              duration: 0.15,
              ease: "easeInOut",
              opacity: { duration: 0.15 },
            }}
          >
            <FeedView
              idle={selectedTab !== "home"}
              initialPost={
                videoData && videoData.video_url ? videoData : undefined
              }
            />
          </motion.div>

          <AnimatePresence>
            {selectedTab === "profile" && (
              <Profile user={user || null} isCurrentUser />
            )}
          </AnimatePresence>

          {selectedTab === null && children}
        </div>
        <Navbar selected={selectedTab} onTabChange={setSelectedTab} />
      </div>
      <ConnectSignerDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}
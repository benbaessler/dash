"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Navbar } from "./components/navbar";
import { ConnectSignerDialog } from "./components/dialogs/connect-signer";
import { useSigner } from "@/providers/SignerProvider";
import { useFrame } from "@/providers/FrameProvider";
import { usePathname, useSearchParams } from "next/navigation";
import { Profile } from "./components/profile";
import { SearchPage } from "./components/search";
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast";
import { fetcher } from "@/utils/fetcher";
import { FeedPage } from "./components/feed";

interface Props {
  children?: ReactNode;
}

export function App({ children }: Props) {
  const { showDialog, setShowDialog } = useSigner();
  const { sessionToken, signIn, user } = useFrame();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const hash = pathname.startsWith("/v")
    ? searchParams.get("castHash")
    : undefined;

  const { data: videoData, error } = useSWR<VideoData>(
    sessionToken && hash ? `/api/video/${hash}` : null,
    (url) => fetcher(url, sessionToken!),
    { revalidateOnFocus: false }
  );

  const initialTab = useMemo(() => {
    if (pathname === "/profile") return "profile";
    if (pathname === "/search") return "search";
    if (pathname === "/" || pathname.startsWith("/v")) return "home";
    if (pathname === `/u/${user?.username}`) return "profile";
    return null;
  }, [pathname, user?.username]);

  const [selectedTab, setSelectedTab] = useState<Tab | null>(initialTab);

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

  const initialPost = videoData && videoData.video_url ? videoData : undefined;

  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <motion.div
            className="absolute inset-0"
            animate={{
              x:
                selectedTab === "search"
                  ? "-100%"
                  : selectedTab === "profile"
                  ? "-100%"
                  : "0%",
            }}
            transition={{
              type: "tween",
              duration: 0.12,
              ease: "easeInOut",
            }}
          >
            <FeedPage
              initialFeed="explore"
              initialVideo={initialPost}
              idle={selectedTab !== "home"}
            />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            animate={{
              x:
                selectedTab === "home"
                  ? "100%"
                  : selectedTab === "profile"
                  ? "-100%"
                  : "0%",
            }}
            transition={{
              type: "tween",
              duration: 0.12,
              ease: "easeInOut",
            }}
          >
            <SearchPage />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            animate={{
              x:
                selectedTab === "home"
                  ? "100%"
                  : selectedTab === "search"
                  ? "100%"
                  : "0%",
            }}
            transition={{
              type: "tween",
              duration: 0.12,
              ease: "easeInOut",
            }}
          >
            <Profile user={user || null} isCurrentUser />
          </motion.div>

          {selectedTab === null && children}
        </div>
        <Navbar selected={selectedTab} onTabChange={setSelectedTab} />
      </div>
      <ConnectSignerDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}

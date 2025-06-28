"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navbar } from "./components/navbar";
import { ConnectSignerDialog } from "./components/dialogs/connect-signer";
import { useSigner } from "@/providers/SignerProvider";
import { useFrame } from "@/providers/FrameProvider";
import { usePathname } from "next/navigation";
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
  const { toast } = useToast();

  const hash = pathname.startsWith("/v")
    ? pathname.split("/").pop()
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

  const [selectedTab, setSelectedTab] = useState<"home" | "profile" | null>(
    initialTab
  );

  useEffect(() => {
    setSelectedTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!sessionToken) signIn();
  }, [sessionToken, signIn]);

  if (error) {
    toast({
      title: "Video not found",
      description: "The linked cast could not be found",
    });
  }

  if (videoData && !videoData.video_url) {
    toast({
      title: "Not a video",
      description: "The linked cast is not a video",
    });
  }

  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <FeedView idle={selectedTab !== "home"} initialPost={videoData} />
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

// TODO: handle profile links

// "use client";

// import { useParams } from "next/navigation";
// import useSWR from "swr";
// import { User } from "@neynar/nodejs-sdk/build/api";
// import { Profile } from "@/app/components/profile";
// import { useFrame } from "@/providers/FrameProvider";

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// export default function ProfilePage() {
//   const { handle } = useParams();
//   const { context } = useFrame();

//   const { data: userData } = useSWR<User>(
//     context?.user?.fid
//       ? `/api/user/handle/${handle}?viewerFid=${context?.user?.fid}`
//       : null,
//     fetcher,
//     {
//       revalidateOnFocus: false,
//       revalidateIfStale: false,
//       revalidateOnReconnect: false,
//     }
//   );

//   return <Profile user={userData || null} />;
// }

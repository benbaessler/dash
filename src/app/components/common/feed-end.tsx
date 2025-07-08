import { SealCheckIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Channel } from "@neynar/nodejs-sdk/build/api";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { useFrame } from "@/providers/FrameProvider";
import { Profile } from "@/app/components/profile";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  channelId: string;
}

export const FeedEnd = ({ channelId }: Props) => {
  const { sessionToken } = useFrame();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: channel } = useSWR<Channel>(
    sessionToken && `/api/channel/${channelId}`,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
    }
  );

  return (
    <>
      <motion.div
        className="relative w-full h-full flex items-center justify-center bg-black"
        animate={{
          x: isProfileOpen ? "-50%" : "0%",
          opacity: isProfileOpen ? 0 : 1,
        }}
        transition={{
          type: "tween",
          duration: 0.15,
          ease: "easeInOut",
        }}
      >
        <div className="flex flex-col items-center -mt-[55px] gap-6">
          <SealCheckIcon size={100} className="text-green-500" />
          <div className="text-xl font-semibold text-center whitespace-nowrap">
            {"You're all caught up!"}
          </div>
          <Button
            variant="action"
            onClick={() => setIsProfileOpen(true)}
          >
            View all /{channelId} videos
          </Button>
        </div>
      </motion.div>
      <AnimatePresence>
        {isProfileOpen && channel && (
          <Profile
            type="channel"
            data={channel}
            onClose={() => setIsProfileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

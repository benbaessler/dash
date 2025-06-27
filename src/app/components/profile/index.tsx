"use client";

import { User } from "@neynar/nodejs-sdk/build/api";
import { Button } from "@/components/ui/button";
import { ClickableText } from "@/app/components/common/text";
import { FarcasterIcon } from "@/assets/icons";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import sdk from "@farcaster/frame-sdk";
import { Avatar } from "@/app/components/video/components/avatar";
import { Skeleton } from "@/app/components/common/skeleton";
import { useFrame } from "@/providers/FrameProvider";
import useSWR from "swr";
import { VideoGrid } from "./components/video-grid";
import { useState } from "react";
import { VideoFeed } from "./components/video-feed";

interface ProfileProps {
  user: User | null;
  isCurrentUser?: boolean;
  onClose?: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Profile({
  user,
  isCurrentUser = false,
  onClose = undefined,
}: ProfileProps) {
  const { context } = useFrame();

  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
    null
  );

  const { data, isLoading } = useSWR<{
    data: VideoData[];
    cursor: string | null;
  }>(
    user && context?.user?.fid
      ? `/api/posts/${user.fid}?viewerFid=${context.user.fid}`
      : null,
    fetcher
  );

  return (
    <div className="h-full overflow-y-auto py-4 relative">
      <div className="max-w-md mx-auto px-4">
        <div className="relative flex items-center justify-center mb-4">
          {onClose && (
            <ArrowLeftIcon
              className="absolute left-0 top-0 w-6 h-6 text-white hover:text-slate-300 transition-colors cursor-pointer"
              weight="bold"
              onClick={onClose}
            />
          )}
          {user ? (
            <h1 className="font-medium text-center">@{user.username}</h1>
          ) : (
            <Skeleton className="h-6 w-24" />
          )}
          {!isCurrentUser && (
            <div
              className="absolute right-0 cursor-pointer"
              onClick={() => user && sdk.actions.viewProfile({ fid: user.fid })}
            >
              <FarcasterIcon className="w-6 h-6 text-white hover:text-slate-300 transition-colors" />
            </div>
          )}
        </div>

        <div className="flex justify-center mb-2">
          {user ? (
            <Avatar
              user={{
                fid: user.fid,
                username: user.username,
                displayName: user.display_name || user.username,
                pfpUrl: user.pfp_url || "",
              }}
              className="w-20 h-20"
            />
          ) : (
            <Skeleton className="w-20 h-20 rounded-full" />
          )}
        </div>

        <div className="text-center mb-2">
          {user ? (
            <h2 className="text-lg font-bold text-white">
              {user.display_name || user.username}
            </h2>
          ) : (
            <Skeleton className="h-7 w-24 mx-auto" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2 max-w-40 mx-auto">
          <div className="text-center">
            {user ? (
              <div className="text-base font-bold text-white">
                {user.following_count}
              </div>
            ) : (
              <Skeleton className="h-6 w-10 mx-auto" />
            )}
            <div className="text-xs text-slate-400">Following</div>
          </div>

          <div className="text-center">
            {user ? (
              <div className="text-base font-bold text-white">
                {user.follower_count}
              </div>
            ) : (
              <Skeleton className="h-6 w-10 mx-auto" />
            )}
            <div className="text-xs text-slate-400">Followers</div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Button
            variant={
              user?.viewer_context?.following ? "outlineAction" : "action"
            }
            size="sm"
            className="max-w-60 w-full"
            disabled={!user}
          >
            {isCurrentUser
              ? "Update"
              : user?.viewer_context?.following
              ? "Following"
              : "Follow"}
          </Button>
        </div>

        {user?.profile?.bio?.text && (
          <div className="text-center mx-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              <ClickableText text={user.profile.bio.text} />
            </p>
          </div>
        )}
      </div>
      <VideoGrid
        data={data?.data || []}
        isLoading={isLoading || !user}
        onItemClick={(index) => setSelectedVideoIndex(index)}
      />
      {selectedVideoIndex !== null && data?.data && (
        <VideoFeed
          data={data.data}
          initialIndex={selectedVideoIndex}
          onClose={() => setSelectedVideoIndex(null)}
        />
      )}
    </div>
  );
}

"use client";

import { User } from "@neynar/nodejs-sdk/build/api";
import { Button } from "@/components/ui/button";
import { ClickableText } from "@/app/components/text";
import { FarcasterIcon } from "@/assets/icons";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import sdk from "@farcaster/frame-sdk";
import { Avatar } from "@/app/components/avatar";
import { Skeleton } from "@/app/components/skeleton";
import { useFrame } from "@/providers/FrameProvider";
import useSWR from "swr";
import { VideoGrid } from "./video-grid";
import { useState } from "react";
import { VideoFeed } from "./video-feed";

interface ProfileProps {
  user: User | null;
  isCurrentUser?: boolean;
  onClose?: () => void;
}

export function Profile({
  user,
  isCurrentUser = false,
  onClose,
}: ProfileProps) {
  const { context } = useFrame();
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
    null
  );

  const { data, isLoading } = useSWR<{
    posts: Post[];
    cursor: string | null;
  }>(
    user && context?.user?.fid
      ? `/api/posts/${user.fid}?viewerFid=${context.user.fid}`
      : null,
    fetcher
  );

  const handleVideoClick = (index: number) => {
    setSelectedVideoIndex(index);
  };

  const handleCloseFeed = () => {
    setSelectedVideoIndex(null);
  };

  return (
    <div className="min-h-screen py-4 relative">
      <div className="max-w-md mx-auto px-4">
        <div className="relative flex items-center justify-center mb-4">
          {!isCurrentUser && (
            <ArrowLeftIcon
              className="absolute left-0 w-5 h-5 text-white hover:text-slate-300 transition-colors cursor-pointer"
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
              imageUrl={user?.pfp_url || ""}
              altText={user?.username || ""}
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

          {/* <div className="text-center">
            {user ? (
              <div className="text-base font-bold text-white">
                {postsData?.data?.length ?? 0}
              </div>
            ) : (
              <Skeleton className="h-6 w-10 mx-auto" />
            )}
            <div className="text-xs text-slate-400">Videos</div>
          </div> */}
        </div>

        <div className="flex justify-center mb-4">
          <Button
            variant="action"
            size="sm"
            className="max-w-60 w-full"
            disabled={!user}
          >
            {isCurrentUser ? "Update" : "Follow"}
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
        posts={data?.posts || []}
        isLoading={isLoading || !user}
        onVideoClick={handleVideoClick}
      />
      {selectedVideoIndex !== null && data?.posts && (
        <VideoFeed
          posts={data.posts}
          initialIndex={selectedVideoIndex}
          onClose={handleCloseFeed}
        />
      )}
    </div>
  );
}

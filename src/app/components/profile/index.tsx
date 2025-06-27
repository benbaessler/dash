"use client";

import { User } from "@neynar/nodejs-sdk/build/api";
import { Button } from "@/components/ui/button";
import { ClickableText } from "@/app/components/common/text";
import { FarcasterIcon } from "@/assets/icons";
import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import sdk from "@farcaster/frame-sdk";
import { Avatar } from "@/app/components/video/components/avatar";
import { useFrame } from "@/providers/FrameProvider";
import useSWRInfinite from "swr/infinite";
import { Skeleton } from "@/app/components/common/skeleton";
import { VideoGrid } from "./components/video-grid";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { VideoFeed } from "./components/video-feed";
import { useSigner } from "@/providers/SignerProvider";
import { Loader } from "lucide-react";

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
  const { context, sessionToken } = useFrame();
  const { verifySigner } = useSigner();

  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
    null
  );

  const [following, setFollowing] = useState(
    user?.viewer_context?.following || false
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingSpinnerRef = useRef<HTMLDivElement>(null);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const getKey = (
    pageIndex: number,
    previousPageData: { data: VideoData[]; cursor: string | null } | null
  ) => {
    if (pageIndex === 0) {
      return user && context?.user?.fid
        ? `/api/posts/${user.fid}?viewerFid=${context.user.fid}`
        : null;
    }
    if (
      previousPageData &&
      (!previousPageData.cursor || previousPageData.data.length === 0)
    ) {
      return null;
    }
    return user && context?.user?.fid
      ? `/api/posts/${user.fid}?viewerFid=${context.user.fid}&cursor=${
          previousPageData?.cursor || ""
        }`
      : null;
  };

  const {
    data: pagesData,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    persistSize: true,
    revalidateAll: false,
  });

  const flattenedData = useMemo(() => {
    if (!pagesData) return [];
    return pagesData.flatMap((page) => page.data);
  }, [pagesData]);

  const displayedData = useMemo(() => {
    if (!flattenedData.length) return [];

    if (hasReachedEnd) return flattenedData;

    const completeRows = Math.floor(flattenedData.length / 3);
    return flattenedData.slice(0, completeRows * 3);
  }, [flattenedData, hasReachedEnd]);

  useEffect(() => {
    if (pagesData && pagesData.length > 0) {
      const lastPage = pagesData[pagesData.length - 1];
      if (lastPage.data.length === 0) {
        setHasReachedEnd(true);
      }
    }
  }, [pagesData]);

  const nextCursor = pagesData?.[pagesData.length - 1]?.cursor;

  const loadMore = useCallback(() => {
    const canLoadMore =
      nextCursor && !isLoading && !isValidating && !hasReachedEnd;
    if (canLoadMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [nextCursor, isLoading, isValidating, hasReachedEnd, setSize]);

  useEffect(() => {
    const spinner = loadingSpinnerRef.current;
    if (!spinner) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasReachedEnd) {
          // Debounce the loading to prevent rapid successive calls
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          debounceTimeoutRef.current = setTimeout(() => {
            loadMore();
          }, 200);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(spinner);

    return () => {
      observer.disconnect();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [loadMore, hasReachedEnd]);

  const handleFollowChange = async (state: boolean) => {
    const valid = await verifySigner();
    if (!valid) return;

    if (state) await sdk.haptics.impactOccurred("medium");
    setFollowing(state);

    const response = await fetch(
      state ? `/api/follow/${user?.fid}` : `/api/unfollow/${user?.fid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ fid: user?.fid }),
      }
    );

    if (!response.ok) {
      setFollowing(!state);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-full max-h-[calc(100vh-64px)] overflow-y-auto py-4 relative"
    >
      <div className="max-w-md mx-auto px-4">
        <div className="relative flex items-center justify-center mb-4">
          {onClose && (
            <ArrowLeftIcon
              className="absolute left-0 top-0 w-6 h-6 text-white hover:text-slate-300 transition-colors cursor-pointer"
              weight="bold"
              onClick={onClose}
            />
          )}
          {user && (
            <h1 className="font-medium text-center">@{user.username}</h1>
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
          {user && (
            <h2 className="text-lg font-bold text-white">
              {user.display_name || user.username}
            </h2>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2 max-w-40 mx-auto">
          <div className="text-center">
            <div className="text-base font-bold text-white">
              {user?.following_count || "-"}
            </div>
            <div className="text-xs text-slate-400">Following</div>
          </div>

          <div className="text-center">
            <div className="text-base font-bold text-white">
              {user?.follower_count || "-"}
            </div>
            <div className="text-xs text-slate-400">Followers</div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Button
            variant={following ? "outlineAction" : "action"}
            size="sm"
            className="max-w-48 w-full"
            disabled={!user}
            onClick={() =>
              isCurrentUser
                ? sdk.actions.composeCast({})
                : handleFollowChange(!following)
            }
          >
            {isCurrentUser && <PlusIcon weight="bold" />}
            {isCurrentUser ? "Upload" : following ? "Following" : "Follow"}
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
        data={displayedData}
        isLoading={isLoading}
        onItemClick={(index) => setSelectedVideoIndex(index)}
      />
      {!hasReachedEnd && (
        <div
          ref={loadingSpinnerRef}
          className="flex justify-center items-center py-8"
        >
          <Loader className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      )}
      {selectedVideoIndex !== null && flattenedData && (
        <VideoFeed
          data={flattenedData}
          initialIndex={selectedVideoIndex}
          onClose={() => setSelectedVideoIndex(null)}
        />
      )}
    </div>
  );
}

"use client";

import { User, Channel } from "@neynar/nodejs-sdk/build/api";
import { Button } from "@/components/ui/button";
import { ClickableText } from "@/app/components/common/text";
import { FarcasterIcon } from "@/assets/icons";
import { ArrowLeftIcon, ExportIcon, PlusIcon } from "@phosphor-icons/react";
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
import { useAnalytics } from "@/hooks/useAnalytics";
import { appUrl } from "@/constants";
import { motion, AnimatePresence } from "motion/react";
import { fetcher } from "@/utils/fetcher";

interface Props {
  data: User | Channel | null;
  type: 'user' | 'channel';
  isCurrentUser?: boolean;
  onClose?: () => void;
}

export function Profile({
  data,
  type,
  isCurrentUser = false,
  onClose = undefined,
}: Props) {
  const { sessionToken, user: currentUser } = useFrame();
  const { verifySigner } = useSigner();
  const { trackEvent } = useAnalytics();

  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
    null
  );

  const [following, setFollowing] = useState(
    type === 'user' ? (data as User)?.viewer_context?.following || false : false
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
      if (type === 'user') {
        return data && sessionToken ? `/api/videos/user/${(data as User).fid}` : null;
      } else {
        return data && sessionToken ? `/api/videos/channel/${(data as Channel).id}` : null;
      }
    }
    if (
      previousPageData &&
      (!previousPageData.cursor || previousPageData.data.length === 0)
    ) {
      return null;
    }
    if (type === 'user') {
      return data && sessionToken
        ? `/api/videos/user/${(data as User).fid}?cursor=${previousPageData?.cursor || ""}`
        : null;
    } else {
      return data && sessionToken
        ? `/api/videos/channel/${(data as Channel).id}?cursor=${previousPageData?.cursor || ""}`
        : null;
    }
  };

  const {
    data: pagesData,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite(getKey, (url: string) => fetcher(url, sessionToken!), {
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
      if (lastPage.data.length === 0 || !lastPage.cursor) {
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
    if (type !== 'user') return;
    
    const valid = await verifySigner();
    if (!valid) return;

    if (state) await sdk.haptics.impactOccurred("medium");
    setFollowing(state);

    const response = await fetch(
      state ? `/api/follow/${(data as User)?.fid}` : `/api/unfollow/${(data as User)?.fid}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      setFollowing(!state);
    }

    trackEvent(state ? "followed_from_profile" : "unfollowed", {
      user: currentUser?.username,
      target: (data as User)?.username,
    });
  };

  const handleShare = async () => {
    const result = await sdk.actions.composeCast({
      text: isCurrentUser
        ? `Check out my videos on /dash!`
        : type === 'user'
          ? `Check out @${(data as User)?.username} on /dash!`
          : `Check out /${(data as Channel)?.id} on /dash!`,
      embeds: [type === 'user' 
        ? `${appUrl}/u/${(data as User)?.username}?utm_source=share_profile`
        : `${appUrl}/c/${(data as Channel)?.id}?utm_source=share_profile`
      ],
    });

    if (result && result.cast) {
      trackEvent("shared_profile", {
        user: currentUser?.username,
        target: type === 'user' ? (data as User)?.username : (data as Channel)?.id,
        castHash: result.cast.hash,
      });
    }
  };

  return (
    <motion.div
      key="profile"
      className="fixed inset-0 bg-black z-[10]"
      initial={{ x: "50%", opacity: 0 }}
      animate={{ x: "0%", opacity: 1 }}
      exit={{ x: "50%", opacity: 0 }}
      transition={{
        type: "tween",
        duration: 0.15,
        ease: "easeInOut",
        opacity: { duration: 0.15 },
      }}
    >
      <motion.div
        ref={scrollContainerRef}
        className="h-full max-h-[calc(100vh-64px)] overflow-y-auto py-4 relative"
        animate={{
          opacity: selectedVideoIndex !== null ? 0 : 1,
        }}
        transition={{
          type: "tween",
          duration: 0.2,
          ease: "easeInOut",
        }}
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
            {data && (
              <h1 className="font-medium text-center">
                {type === 'user' ? `@${(data as User).username}` : `/${(data as Channel).id}`}
              </h1>
            )}
            {!isCurrentUser && (
              <div className="absolute right-0 gap-3 cursor-pointer flex items-center">
                <div
                  onClick={handleShare}
                  className="hover:text-slate-300 transition-colors"
                >
                  <ExportIcon weight="bold" size={21} />
                </div>
                <div
                  onClick={() => {
                    if (type === 'user') {
                      data && sdk.actions.viewProfile({ fid: (data as User).fid })
                    }
                  }}
                >
                  <FarcasterIcon className="w-6 h-6 text-white hover:text-slate-300 transition-colors" />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center mb-2">
            {data ? (
              type === 'user' ? (
                <Avatar
                  user={{
                    fid: (data as User).fid,
                    username: (data as User).username,
                    displayName: (data as User).display_name || (data as User).username,
                    pfpUrl: (data as User).pfp_url || "",
                  }}
                  className="w-20 h-20"
                />
              ) : (
                <img
                  src={(data as Channel).image_url}
                  alt={(data as Channel).name || (data as Channel).id}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )
            ) : (
              <Skeleton className="w-20 h-20 rounded-full" />
            )}
          </div>

          <div className="text-center mb-2">
            {data && (
              <h2 className="text-lg font-bold text-white">
                {type === 'user' 
                  ? (data as User).display_name || (data as User).username
                  : (data as Channel).name || (data as Channel).id
                }
              </h2>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2 max-w-40 mx-auto">
            {type === 'user' ? (
              <>
                <div className="text-center">
                  <div className="text-base font-bold text-white">
                    {(data as User)?.following_count || "-"}
                  </div>
                  <div className="text-xs text-slate-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-white">
                    {(data as User)?.follower_count || "-"}
                  </div>
                  <div className="text-xs text-slate-400">Followers</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-base font-bold text-white">
                    {(data as Channel)?.member_count || "-"}
                  </div>
                  <div className="text-xs text-slate-400">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-white">
                    {(data as Channel)?.follower_count || "-"}
                  </div>
                  <div className="text-xs text-slate-400">Followers</div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center mb-4 max-w-48 mx-auto gap-2">
            <Button
              variant={following ? "outlineAction" : "action"}
              size="sm"
              className="flex-grow"
              disabled={!data}
              onClick={() => {
                if (isCurrentUser) {
                  handleShare();
                } else if (type === 'user') {
                  handleFollowChange(!following);
                }
              }}
            >
              {isCurrentUser && <ExportIcon size={16} weight="bold" />}
              {isCurrentUser ? "Share" : type === 'channel' ? "Add feed" : following ? "Following" : "Follow"}
              {type === 'channel' && <PlusIcon size={16} weight="bold" />}
            </Button>
          </div>

          {((type === 'user' && (data as User)?.profile?.bio?.text) || 
            (type === 'channel' && (data as Channel)?.description)) && (
            <div className="text-center mx-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                <ClickableText 
                  text={type === 'user' 
                    ? (data as User)?.profile?.bio?.text || ''
                    : (data as Channel)?.description || ''
                  } 
                />
              </p>
            </div>
          )}
        </div>
        <VideoGrid
          data={displayedData}
          isLoading={isLoading}
          hasReachedEnd={hasReachedEnd}
          onItemClick={(index) => {
            setSelectedVideoIndex(index);
            trackEvent("opened_profile_video", {
              user: currentUser?.username,
              target: flattenedData[index].author.username,
              castHash: flattenedData[index].id,
              channelId: type === 'channel' ? (data as Channel)?.id : undefined,
            });
          }}
        />
        {!hasReachedEnd && (
          <div
            ref={loadingSpinnerRef}
            className="flex justify-center items-center py-8"
          >
            <Loader className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedVideoIndex !== null && flattenedData && (
          <VideoFeed
            data={flattenedData}
            initialIndex={selectedVideoIndex}
            onClose={() => setSelectedVideoIndex(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

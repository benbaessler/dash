"use client";

import { useFrame } from "@/providers/FrameProvider";
import { isDevelopment } from "@/constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { insertPromotions } from "@/utils/insertPromotions";
import { fetcher } from "@/utils/fetcher";

interface UseFeedProps {
  initialLimit?: number;
  initialVideo?: VideoData;
}

export const useFeed = ({ initialLimit = 30, initialVideo }: UseFeedProps) => {
  const { isSDKLoaded, context, added, sessionToken } = useFrame();
  const fid = isDevelopment ? 367782 : context?.user.fid;

  const [feed, setFeed] = useState<FeedItem[]>(
    initialVideo ? [initialVideo] : []
  );
  const [fetching, setFetching] = useState(false);

  const { data, isValidating } = useSWR(
    sessionToken && fid && isSDKLoaded
      ? `/api/feed?limit=${initialLimit}`
      : null,
    (url) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  const promotions = useMemo(
    () => [
      !added
        ? { type: "add-frame" as const, index: 7 }
        : { type: "share-app" as const, index: 7 },
      { type: "join-channel" as const, index: 15 },
    ],
    [added]
  );

  useEffect(() => {
    if (data && feed.length <= 1) {
      const videos = initialVideo
        ? [
            initialVideo,
            ...data.filter((item: VideoData) => item.id !== initialVideo.id),
          ]
        : data;

      const feedWithPromotions = insertPromotions(videos, promotions);
      setFeed(feedWithPromotions);
    }
  }, [data]);

  const fetchMore = useCallback(
    async (limit: number = 25) => {
      if (!sessionToken) return;

      setFetching(true);
      try {
        const response = await fetch(`/api/feed?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch feed: ${response.status}`);
        }
        const data = await response.json();
        setFeed((prev) => {
          const existingFeed = prev || [];
          const uniqueVideos = data.filter(
            (newVideo: VideoData) =>
              !existingFeed.some(
                (item: FeedItem) => "id" in item && item.id === newVideo.id
              )
          );
          return [...existingFeed, ...uniqueVideos];
        });
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setFetching(false);
      }
    },
    [setFetching, setFeed, sessionToken]
  );

  return {
    feed,
    fetching: fetching || isValidating,
    fetchMore,
  };
};

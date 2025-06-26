"use client";

import { useFrame } from "@/providers/FrameProvider";
import { isDevelopment } from "@/constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { insertPromotions } from "@/utils/insertPromotions";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }
  const { data } = await response.json();
  return data;
};

interface UseFeedProps {
  initialLimit?: number;
  initialPost?: VideoData;
}

export const useFeed = ({ initialLimit = 15, initialPost }: UseFeedProps) => {
  const { isSDKLoaded, context, added } = useFrame();
  const fid = isDevelopment ? 367782 : context?.user.fid;

  const [feed, setFeed] = useState<FeedItem[]>(
    initialPost ? [initialPost] : []
  );
  const [fetching, setFetching] = useState(false);

  const { data, isValidating } = useSWR(
    fid && isSDKLoaded ? `/api/feed/${fid}?limit=${initialLimit}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
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
      const videos = initialPost
      ? [
          initialPost,
          ...data.filter((item: VideoData) => item.id !== initialPost.id),
        ]
      : data

      const feedWithPromotions = insertPromotions(videos, promotions);
      setFeed(feedWithPromotions);
    }
  }, [data]);

  const fetchMore = useCallback(
    async (limit: number = initialLimit) => {
      if (!fid) return;

      setFetching(true);
      try {
        const response = await fetch(`/api/feed/${fid}?limit=${limit}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch feed: ${response.status}`);
        }
        const { data } = await response.json();
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
    [initialLimit, fid, setFetching, setFeed]
  );

  return {
    feed,
    fetching: fetching || isValidating,
    fetchMore,
  };
};

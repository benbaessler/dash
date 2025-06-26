"use client";

import { useFrame } from "@/providers/FrameProvider";
import { isDevelopment } from "@/constants";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

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

  // useEffect(() => {
  //   const updatePromotionPages = async () => {
  //     const promotions = [
  //       !added
  //         ? { type: "add-frame", index: 7 }
  //         : { type: "share-app", index: 7 },
  //       { type: "join-channel", index: 15 },
  //     ] as PromotionData[];
  //   };

  // }, [added, isSDKLoaded]);

  useEffect(() => {
    if (data && feed.length <= 1) {
      setFeed(
        initialPost
          ? [
              initialPost,
              ...data.filter((item: VideoData) => item.id !== initialPost.id),
            ]
          : data
      );
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

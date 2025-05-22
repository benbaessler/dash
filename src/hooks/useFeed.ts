"use client";

import { useCallback, useEffect, useState } from "react";
import { useFrame } from "@/providers/FrameProvider";
import { isDevelopment } from "@/constants";
import useSWR from "swr";

export type PromotionFrame = {
  promotionType: "add-frame" | "share-app" | "join-channel";
  index: number;
};

interface UseFeedOptions {
  initialLimit?: number;
  defaultPromotionFrames?: PromotionFrame[];
}

interface UseFeedResult {
  feed: Post[] | null;
  setFeed: React.Dispatch<React.SetStateAction<Post[] | null>>;
  fetching: boolean;
  fetchFeed: (limit?: number) => Promise<void>;
  getPostIndex: (virtualIndex: number) => number;
  promotionFrames: PromotionFrame[];
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }
  const result = await response.json();
  return result.data;
};

export function useFeed({
  initialLimit = 15,
}: UseFeedOptions = {}): UseFeedResult {
  const { isSDKLoaded, context, added } = useFrame();
  const [feed, setFeed] = useState<Post[] | null>(null);
  const [fetching, setFetching] = useState(false);

  const promotionFrames = [
    added
      ? { promotionType: "share-app", index: 7 }
      : { promotionType: "add-frame", index: 7 },
    { promotionType: "join-channel", index: 15 },
  ];

  const getPostIndex = (virtualIndex: number): number => {
    const framesBefore = promotionFrames.filter(
      (frame) => frame.index < virtualIndex
    ).length;

    return virtualIndex - framesBefore;
  };

  const fid = isDevelopment ? 367782 : context?.user.fid;

  const { data, isValidating } = useSWR(
    fid && isSDKLoaded ? `/api/feed/${fid}?limit=${initialLimit}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (data && !feed) {
      setFeed(data);
    }
  }, [data, feed]);

  const fetchFeed = useCallback(
    async (limit: number = initialLimit) => {
      if (!fid) return;

      setFetching(true);
      try {
        const response = await fetch(`/api/feed/${fid}?limit=${limit}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch feed: ${response.status}`);
        }
        const { data } = await response.json();
        setFeed((prevFeed) => {
          const prevPosts = prevFeed || [];
          const uniquePosts = data.filter(
            (newPost: Post) =>
              !prevPosts.some(
                (existingPost: Post) => existingPost.id === newPost.id
              )
          );
          return [...prevPosts, ...uniquePosts];
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
    setFeed,
    fetching: fetching || isValidating,
    fetchFeed,
    getPostIndex,
    promotionFrames: promotionFrames as PromotionFrame[],
  };
}

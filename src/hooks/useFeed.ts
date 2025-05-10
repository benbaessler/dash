"use client";

import { useEffect, useState } from "react";
import { useFrame } from "@/providers/FrameProvider";
import { isDevelopment } from "@/constants";

interface UseFeedOptions {
  initialLimit?: number;
  defaultPromotionPageIndex?: number;
}

interface UseFeedResult {
  feed: Post[] | null;
  setFeed: React.Dispatch<React.SetStateAction<Post[] | null>>;
  fetching: boolean;
  fetchFeed: (limit?: number) => Promise<void>;
  getPostIndex: (virtualIndex: number) => number;
  promotionPageIndex: number;
  prepareFeedWithShareFrame: (
    feed: Post[] | null,
    activeVideoIndex: number,
    renderItem: (post: Post, index: number, isActive: boolean) => React.ReactNode,
    renderShareFrame: () => React.ReactNode
  ) => React.ReactNode[];
}

export function useFeed({
  initialLimit = 15,
  defaultPromotionPageIndex = 10,
}: UseFeedOptions = {}): UseFeedResult {
  const { isSDKLoaded, context } = useFrame();
  const [feed, setFeed] = useState<Post[] | null>(null);
  const [fetching, setFetching] = useState(false);
  
  // Share frame position in the feed (0-based index)
  const promotionPageIndex = 
    Number(process.env.NEXT_PUBLIC_PROMOTION_PAGE_INDEX) || defaultPromotionPageIndex;

  // Map to track the real index of posts with ShareFrame inserted
  const getPostIndex = (virtualIndex: number): number => {
    // If we're past the share frame
    return virtualIndex > promotionPageIndex ? virtualIndex - 1 : virtualIndex;
  };

  const fetchFeed = async (limit: number = initialLimit) => {
    const fid = isDevelopment ? 367782 : context?.user.fid;

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
          (newPost: Post) => !prevPosts.some((existingPost: Post) => existingPost.id === newPost.id)
        );
        return [...prevPosts, ...uniquePosts];
      });
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setFetching(false);
    }
  };

  // Prepare feed items with ShareFrame inserted
  const prepareFeedWithShareFrame = (
    feed: Post[] | null,
    activeVideoIndex: number,
    renderItem: (post: Post, index: number, isActive: boolean) => React.ReactNode,
    renderShareFrame: () => React.ReactNode
  ): React.ReactNode[] => {
    const feedWithShareFrame: React.ReactNode[] = [];
    
    if (!feed) return feedWithShareFrame;

    feed.forEach((post, index) => {
      // Insert ShareFrame at the configured position
      if (promotionPageIndex !== 0 && index === promotionPageIndex) {
        feedWithShareFrame.push(renderShareFrame());
      }

      // Add the post item
      feedWithShareFrame.push(
        renderItem(post, index, getPostIndex(activeVideoIndex) === index)
      );
    });

    return feedWithShareFrame;
  };

  useEffect(() => {
    if (isSDKLoaded && context?.user.fid) {
      fetchFeed();
    }
  }, [isSDKLoaded, context]);

  return {
    feed,
    setFeed,
    fetching,
    fetchFeed,
    getPostIndex,
    promotionPageIndex,
    prepareFeedWithShareFrame,
  };
}
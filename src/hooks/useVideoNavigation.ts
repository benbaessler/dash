"use client";

import { useState, useCallback } from "react";

interface UseVideoNavigationOptions {
  initialIndex?: number;
  onIndexChange?: (newIndex: number) => void;
  feedLength: number;
  promotionPageIndexes?: number[];
  getPostIndex?: (virtualIndex: number) => number;
  fetchMoreContent?: (limit?: number) => Promise<void>;
  fetching?: boolean;
}

interface UseVideoNavigationResult {
  activeVideoIndex: number;
  setActiveVideoIndex: (index: number) => void;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  shouldPreloadVideo: (index: number) => boolean;
}

export function useVideoNavigation({
  initialIndex = 0,
  onIndexChange,
  feedLength,
  promotionPageIndexes = [],
  getPostIndex = (i) => i,
  fetchMoreContent,
  fetching,
}: UseVideoNavigationOptions): UseVideoNavigationResult {
  const [activeVideoIndex, setActiveVideoIndex] = useState(initialIndex);

  // Handle scroll events to determine active video
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const scrollPosition = container.scrollTop;
      const windowHeight = container.clientHeight;
      const newIndex = Math.round(scrollPosition / windowHeight);

      if (newIndex !== activeVideoIndex) {
        setActiveVideoIndex(newIndex);
        if (onIndexChange) {
          onIndexChange(newIndex);
        }

        if (promotionPageIndexes.includes(newIndex)) return;

        const realPostIndex = getPostIndex(newIndex);

        // Fetch more content when user has scrolled through 5 videos or near the end of the feed
        if (
          fetchMoreContent &&
          !fetching &&
          (realPostIndex % 5 === 0 || realPostIndex >= feedLength - 3)
        ) {
          fetchMoreContent(10);
        }
      }
    },
    [
      activeVideoIndex,
      onIndexChange,
      promotionPageIndexes,
      getPostIndex,
      fetchMoreContent,
      fetching,
      feedLength,
    ]
  );

  // Determine if a video should be preloaded
  const shouldPreloadVideo = useCallback(
    (index: number): boolean => {
      // Preload current video and next 2 videos
      return (
        index === getPostIndex(activeVideoIndex) ||
        index === getPostIndex(activeVideoIndex) + 1 ||
        index === getPostIndex(activeVideoIndex) + 2
      );
    },
    [activeVideoIndex, getPostIndex]
  );

  return {
    activeVideoIndex,
    setActiveVideoIndex,
    handleScroll,
    shouldPreloadVideo,
  };
}
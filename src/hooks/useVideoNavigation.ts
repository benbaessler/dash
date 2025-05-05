"use client";

import { useState, useCallback } from "react";

interface UseVideoNavigationOptions {
  onIndexChange?: (newIndex: number) => void;
  feedLength: number;
  promotionPageIndex: number;
  getPostIndex: (virtualIndex: number) => number;
  fetchMoreContent?: (limit?: number) => Promise<void>;
  fetching: boolean;
}

interface UseVideoNavigationResult {
  activeVideoIndex: number;
  setActiveVideoIndex: (index: number) => void;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  shouldPreloadVideo: (index: number) => boolean;
}

export function useVideoNavigation({
  onIndexChange,
  feedLength,
  promotionPageIndex,
  getPostIndex,
  fetchMoreContent,
  fetching,
}: UseVideoNavigationOptions): UseVideoNavigationResult {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

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

        // Don't process further if we're on the share frame
        // This prevents video loading/autoplay issues when on the share frame
        if (newIndex === promotionPageIndex) return;

        // Get the real post index (accounting for share frame)
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
      promotionPageIndex, 
      getPostIndex, 
      fetchMoreContent, 
      fetching, 
      feedLength
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
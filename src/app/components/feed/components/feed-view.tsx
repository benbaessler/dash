"use client";

import { Promotion } from "../../promotion";
import { VideoItem } from "../../video";
import { useEffect, useCallback, useState, useRef } from "react";
import { Loading } from "../../common/loading";

interface FeedViewProps {
  feed: FeedItem[];
  fetching: boolean;
  fetchMore: () => void;
  idle?: boolean;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function FeedView({
  feed,
  fetching,
  fetchMore,
  idle = false,
  initialIndex = 0,
  onIndexChange,
}: FeedViewProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isInternalScrollingRef = useRef(false);

  useEffect(() => {
    if (scrollContainerRef.current && !isInternalScrollingRef.current) {
      const container = scrollContainerRef.current;

      const scrollToPosition = () => {
        const windowHeight = container.clientHeight;
        const targetScrollPosition = initialIndex * windowHeight;

        container.scrollTo({
          top: targetScrollPosition,
          behavior: "instant",
        });
      };

      if (container.clientHeight > 0) {
        scrollToPosition();
      } else {
        requestAnimationFrame(scrollToPosition);
      }
    }
  }, [initialIndex]);

  useEffect(() => {
    if (feed.length > 1 && !fetching && activeIndex > feed.length - 10) {
      fetchMore();
    }
  }, [activeIndex, feed, fetching]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const scrollPosition = container.scrollTop;
      const windowHeight = container.clientHeight;
      const newIndex = Math.round(scrollPosition / windowHeight);
      const clampedIndex = Math.max(0, Math.min(feed.length - 1, newIndex));

      isInternalScrollingRef.current = true;
      
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        isInternalScrollingRef.current = false;
      }, 100);

      setActiveIndex(clampedIndex);
      onIndexChange?.(clampedIndex);
    },
    [feed.length, onIndexChange]
  );

  if (feed.length === 0) return <Loading zIndex={5} />;

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-full overflow-y-auto snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {feed.map((item, index) =>
        "type" in item ? (
          <Promotion key={index} type={item.type} />
        ) : (
          <VideoItem
            key={index}
            data={item as VideoData}
            active={activeIndex === index && !idle}
            preload={Math.abs(index - activeIndex) <= 3}
            render={Math.abs(index - activeIndex) <= 5}
            isScrolling={isScrolling}
          />
        )
      )}
    </div>
  );
}

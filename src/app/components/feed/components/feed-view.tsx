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
}

export function FeedView({
  feed,
  fetching,
  fetchMore,
  idle = false,
}: FeedViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);

    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 100);

    setActiveIndex(newIndex);
  }, []);

  if (feed.length === 0) return <Loading zIndex={5} />;

  return (
    <div
      className="flex-1 w-full h-full overflow-y-auto snap-y snap-mandatory"
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

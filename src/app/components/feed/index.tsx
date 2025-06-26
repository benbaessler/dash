"use client";

import { Promotion } from "../promotion";
import { VideoItem } from "../video";
import { useFeed } from "@/hooks";
import { useEffect, useCallback, useState } from "react";
import { Loading } from "../loading";

export function FeedView() {
  const { feed, fetching, fetchMore } = useFeed();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (feed.length > 10 && !fetching && activeIndex > feed.length - 10) {
      fetchMore();
    }
  }, [activeIndex, feed.length, fetching, fetchMore]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);

    setActiveIndex(newIndex);
  }, []);

  if (!feed) return <Loading />;

  return (
    <div
      className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {feed.map((item, index) => (
        <div
          key={index}
          className="h-full w-full flex-shrink-0 relative snap-start snap-always"
        >
          {"type" in item ? (
            <Promotion type={item.type} />
          ) : (
            <VideoItem
              data={item as VideoData}
              active={activeIndex === index}
              preload={Math.abs(index - activeIndex) <= 3}
            />
          )}
        </div>
      ))}
    </div>
  );
}

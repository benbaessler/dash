"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useCallback, useState, useEffect, useRef } from "react";
import { VideoItem } from "@/app/components/video";

interface VideoFeedProps {
  data: VideoData[];
  initialIndex?: number;
  onClose?: () => void;
}

export function VideoFeed({ data, initialIndex = 0, onClose }: VideoFeedProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
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

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const scrollPosition = container.scrollTop;
      const windowHeight = container.clientHeight;
      const newIndex = Math.round(scrollPosition / windowHeight);
      const clampedIndex = Math.max(0, Math.min(data.length - 1, newIndex));

      setActiveIndex(clampedIndex);
    },
    [data.length]
  );

  return (
    <div className="fixed w-full h-full inset-0 bg-black z-[15]">
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full h-[calc(100vh-76px)] overflow-y-auto snap-y snap-mandatory"
        onScroll={handleScroll}
      >
        {data.map((item, index) => (
          <VideoItem
            key={item.id}
            data={item}
            active={activeIndex === index}
            preload={Math.abs(index - activeIndex) <= 3}
            render={Math.abs(index - activeIndex) <= 5}
            disableProfile
          />
        ))}
      </div>
      <button onClick={onClose} className="absolute top-4 left-4 text-white">
        <ArrowLeftIcon className="w-6 h-6 drop-shadow-sm" weight="bold" />
      </button>
    </div>
  );
}

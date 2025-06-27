"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { VideoItem } from "@/app/components/video";

interface VideoFeedProps {
  data: VideoData[];
  initialIndex?: number;
  onClose?: () => void;
}

export function VideoFeed({ data, initialIndex = 0, onClose }: VideoFeedProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);

    setActiveIndex(newIndex);
  }, []);

  return (
    <div className="fixed w-full h-full inset-0 bg-black z-[15]">
      <div
        className="flex-1 w-full h-[calc(100vh-76px)] overflow-y-auto snap-y snap-mandatory"
        onScroll={handleScroll}
      >
        {data.map((item, index) => (
          <VideoItem
            key={item.id}
            data={item}
            active={activeIndex === index}
            preload={Math.abs(index - activeIndex) <= 3}
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

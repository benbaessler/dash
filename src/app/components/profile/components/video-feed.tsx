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
    <div className="fixed inset-0 bg-black z-50">
      <div
        className="overflow-y-scroll snap-y snap-mandatory relative h-full"
        onScroll={handleScroll}
      >
        {data.map((item, index) => (
          <VideoItem
            key={item.id}
            data={item}
            active={activeIndex === index}
            preload={Math.abs(index - activeIndex) <= 3}
          />
        ))}
      </div>
      <button onClick={onClose} className="absolute top-10 left-4 text-white">
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

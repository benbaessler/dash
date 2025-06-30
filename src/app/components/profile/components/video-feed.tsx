"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useCallback, useState, useEffect, useRef } from "react";
import { VideoItem } from "@/app/components/video";
import { motion } from "motion/react";

interface VideoFeedProps {
  data: VideoData[];
  initialIndex?: number;
  onClose?: () => void;
}

export function VideoFeed({ data, initialIndex = 0, onClose }: VideoFeedProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

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
      const clampedIndex = Math.max(0, Math.min(data.length - 1, newIndex));

      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 100);

      setActiveIndex(clampedIndex);
    },
    [data.length]
  );

  return (
    <motion.div
      className="fixed inset-0 z-[15]"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{
        type: "tween",
        duration: 0.2,
        ease: "easeInOut",
      }}
    >
      <div className="w-full h-full bg-black">
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
              isScrolling={isScrolling}
              disableProfile
            />
          ))}
        </div>
        <button onClick={onClose} className="absolute top-4 left-4 text-white">
          <ArrowLeftIcon className="w-6 h-6 drop-shadow-sm" weight="bold" />
        </button>
      </div>
    </motion.div>
  );
}

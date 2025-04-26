"use client";
import { useMemo, useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  post: Post;
  isActive: boolean;
  loading: boolean;
}

export function VideoPlayer({ post, isActive, loading }: VideoPlayerProps) {
  const [ref, inView] = useInView({
    threshold: 0.9,
  });
  const [playTimeout, setPlayTimeout] = useState<NodeJS.Timeout | null>(null);
  const [paused, setPaused] = useState(false);

  const idle = useMemo(() => {
    return !inView || !isActive || loading;
  }, [inView, isActive, loading]);

  const handleClick = () => {
    if (playTimeout) {
      clearTimeout(playTimeout);
      setPlayTimeout(null);
      return;
    }

    const timeout = setTimeout(() => {
      setPaused(!paused);
      setPlayTimeout(null);
    }, 200);

    setPlayTimeout(timeout);
  };

  return (
    <div ref={ref} className="relative w-full h-full" onClick={handleClick}>
      <MediaPlayer
        className="w-full h-full"
        aspectRatio="9 / 16"
        src={post.video_url}
        streamType="on-demand"
        load="eager"
        playsInline
        loop
        autoPlay
        paused={idle || paused}
      >
        <MediaProvider className="w-full h-full" />
      </MediaPlayer>
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayIcon className="size-12 text-white opacity-70 cursor-pointer" />
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}

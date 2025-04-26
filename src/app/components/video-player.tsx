"use client";
import { useEffect, useMemo, useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  post: Post;
  isActive: boolean;
  loading: boolean;
  shouldPreload?: boolean; // Whether this video should be preloaded
}

export function VideoPlayer({ post, isActive, loading, shouldPreload = false }: VideoPlayerProps) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  const [playTimeout, setPlayTimeout] = useState<NodeJS.Timeout | null>(null);
  const [paused, setPaused] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  const idle = useMemo(() => {
    return !inView || !isActive || loading;
  }, [inView, isActive, loading]);

  useEffect(() => {
    // Load the video if it's in view, active, or should be preloaded
    if (inView || isActive || shouldPreload) {
      setShouldLoad(true);
    }
  }, [inView, isActive, shouldPreload]);

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

  useEffect(() => {
    if (!inView) setPaused(false);
  }, [inView, paused]);

  return (
    <div ref={ref} className="relative w-full h-full" onClick={handleClick}>
      {shouldLoad ? (
        <MediaPlayer
          className="w-full h-full"
          aspectRatio="9 / 16"
          src={post.video_url}
          streamType="on-demand"
          load={inView || shouldPreload ? "visible" : "idle"}
          preload={shouldPreload && !isActive ? "metadata" : "auto"}
          playsInline
          loop
          autoPlay={inView && isActive}
          paused={idle || paused}
        >
          <MediaProvider className="w-full h-full" />
        </MediaPlayer>
      ) : (
        <div className="w-full h-full bg-black"></div>
      )}
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

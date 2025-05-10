"use client";
import { useEffect, useMemo, useState, ReactNode } from "react";
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from "@vidstack/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useInView } from "react-intersection-observer";

interface VideoPlayerProps {
  post: Post;
  isActive: boolean;
  loading: boolean;
  shouldPreload?: boolean; // Whether this video should be preloaded
  onPlayerReady?: (player: MediaPlayerInstance) => void;
  renderTimeSlider?: (player: MediaPlayerInstance) => ReactNode;
}

export function VideoPlayer({
  post,
  isActive,
  loading,
  shouldPreload = false,
  onPlayerReady,
  renderTimeSlider,
}: VideoPlayerProps) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  const [playTimeout, setPlayTimeout] = useState<NodeJS.Timeout | null>(null);
  const [paused, setPaused] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [player, setPlayer] = useState<MediaPlayerInstance | null>(null);

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

  const handlePlayerReady = (media: MediaPlayerInstance) => {
    setPlayer(media);
    if (onPlayerReady) {
      onPlayerReady(media);
    }
  };

  return (
    <div ref={ref} className="relative w-full h-full" onClick={handleClick}>
      {shouldLoad ? (
        <MediaPlayer
          className="w-full h-full"
          aspectRatio="9 / 16"
          src={post.video_url}
          streamType="on-demand"
          load={inView || shouldPreload ? "eager" : "idle"}
          preload={shouldPreload && !isActive ? "metadata" : "auto"}
          playsInline
          loop
          autoPlay={inView && isActive}
          paused={idle || paused}
          onAutoPlayFail={() => setPaused(true)}
          fullscreenOrientation="none"
          autoFocus={false}
          ref={handlePlayerReady}
        >
          <MediaProvider className="w-full h-full" />
          {player && renderTimeSlider && renderTimeSlider(player)}
        </MediaPlayer>
      ) : (
        <div className="w-full h-full bg-black"></div>
      )}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayIcon className="size-12 text-white opacity-70 cursor-pointer" />
        </div>
      )}
    </div>
  );
}

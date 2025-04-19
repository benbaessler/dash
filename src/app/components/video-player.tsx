"use client";
import { useEffect, useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { InteractionButtons } from "./interaction-buttons";
import { useInView } from "react-intersection-observer";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/api";

interface VideoPlayerProps {
  cast: CastWithInteractions;
  isActive: boolean;
}

export function VideoPlayer({ cast, isActive }: VideoPlayerProps) {
  const [ref, inView] = useInView({
    threshold: 0.9,
  });
  const [liked, setLiked] = useState(false);
  const [recasted, setRecasted] = useState(false);
  const [playTimeout, setPlayTimeout] = useState<NodeJS.Timeout | null>(null);
  const [paused, setPaused] = useState(true);

  const src = cast.embeds
    .filter((embed: any) => {
      return embed.metadata?.content_type === "application/x-mpegurl";
    })
    .map((embed: any) => {
      return embed.url!;
    })[0];

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
    if (inView && isActive) {
      setPaused(false);
    } else {
      setPaused(true);
    }
  }, [inView, isActive]);

  return (
    <div
      ref={ref}
      className="relative w-full h-full"
      onClick={handleClick}
      onDoubleClick={() => setLiked(true)}
    >
      <MediaPlayer
        className="w-full h-full"
        aspectRatio="9 / 16"
        src={src}
        streamType="on-demand"
        load="eager"
        playsInline
        loop
        autoPlay={false}
        paused={paused}
      >
        <MediaProvider className="w-full h-full" />
      </MediaPlayer>
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayIcon className="size-12 text-white opacity-70 cursor-pointer" />
        </div>
      )}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <InteractionButtons
          cast={cast}
          liked={liked}
          setLiked={setLiked}
          recasted={recasted}
          setRecasted={setRecasted}
        />
      </div>
    </div>
  );
}

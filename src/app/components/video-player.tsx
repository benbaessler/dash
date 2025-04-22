"use client";
import { useMemo, useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { InteractionButtons } from "./interaction-buttons";
import { useInView } from "react-intersection-observer";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/api";
import Image from "next/image";

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
  const [paused, setPaused] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const idle = useMemo(() => {
    return !inView || !isActive;
  }, [inView, isActive]);

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
        paused={idle || paused}
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
      <div className="absolute bottom-0 left-0 right-0 px-6 py-8 mr-16 w-full overflow-hidden">
        <div className="flex flex-col w-full">
          <div className="text-white font-semibold truncate">
            {cast.author.display_name}
          </div>
          <div className="text-white/90 text-sm mt-1 flex items-end gap-1 w-full">
            <div
              className={`flex-1 break-words overflow-hidden ${
                !isTextExpanded ? "line-clamp-2" : ""
              } cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                setIsTextExpanded(!isTextExpanded);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
              }}
            >
              {cast.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

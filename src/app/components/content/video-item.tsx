"use client";
import { Caption } from "../caption";
import { InteractionButtons } from "../interaction-buttons";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFrame } from "@/providers/FrameProvider";
import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
} from "@vidstack/react";
import { PlayIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

interface VideoItemProps {
  data: VideoData;
  active: boolean;
  preload: boolean;
}

export const VideoItem = ({ data, active, preload }: VideoItemProps) => {
  const { trackEvent } = useAnalytics();
  const { user } = useFrame();

  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: false });
  const [paused, setPaused] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout>();

  // Pause video on click
  const handleClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(undefined);
    }

    const timeout = setTimeout(() => {
      setPaused(!paused);
      setClickTimeout(undefined);
    }, 150);

    setClickTimeout(timeout);
  };

  return (
    <div
      ref={ref}
      // onDoubleClick={(e) => {
      //   if (!liked) {
      //     handleInteraction(e, "like", data.id);
      //     trackEvent("double_tap_like", {
      //       user: user?.username,
      //       castHash: data.id,
      //     });
      //   }
      // }}
    >
      <div onClick={handleClick}>
        <MediaPlayer
          aspectRatio="9 / 16"
          src={data.video_url}
          streamType="on-demand"
          load={inView || preload ? "eager" : "idle"}
          preload={preload ? "auto" : "none"}
          playsInline
          loop
          autoPlay={inView}
          paused={!inView || !active || paused}
          onAutoPlayFail={() => setPaused(true)}
          fullscreenOrientation="none"
          autoFocus={false}
        >
          <MediaProvider className="w-full h-full" />

          {/* {player && renderTimeSlider && (
          <div
            className="absolute flex justify-center bottom-0 left-0 right-0 w-full z-10"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {renderTimeSlider(player)}
          </div>
        )} */}
        </MediaPlayer>
        {paused && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayIcon
              weight="fill"
              size={48}
              className="text-white opacity-70 cursor-pointer hover:opacity-90"
            />
          </div>
        )}
      </div>

      {/* <Caption
        post={data}
        expandedTexts={expandedTexts}
        toggleExpandText={toggleExpandText}
      />
      <div className="absolute right-4 bottom-4">
        <InteractionButtons
          post={data}
          liked={data.viewerContext?.liked ?? liked}
          recasted={data.viewerContext?.recasted ?? recasted}
          handleInteraction={(e, type) => handleInteraction(e, type, data.id)}
        />
      </div> */}
    </div>
  );
};

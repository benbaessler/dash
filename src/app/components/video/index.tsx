"use client";
import { Caption } from "./components/caption";
import { InteractionButtons } from "./components/interaction-buttons";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFrame } from "@/providers/FrameProvider";
import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
} from "@vidstack/react";
import { PlayIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { useSigner } from "@/providers/SignerProvider";
import { PlaybackSlider } from "./components/playback-slider";

interface VideoItemProps {
  data: VideoData;
  active: boolean;
  preload: boolean;
}

export const VideoItem = ({ data, active, preload }: VideoItemProps) => {
  const { trackEvent } = useAnalytics();
  const { user, sessionToken } = useFrame();
  const { verifySigner } = useSigner();
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(data.viewerContext?.liked || false);
  const [recasted, setRecasted] = useState(
    data.viewerContext?.recasted || false
  );
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout>();

  const handleInteraction = async (
    event: "liked" | "recasted" | "double_tap_like",
    state: boolean
  ) => {
    const valid = await verifySigner();
    if (!valid) return;

    await sdk.haptics.impactOccurred("medium");

    if (event === "recasted") {
      setRecasted(state);
    } else {
      setLiked(state);
    }

    try {
      const endpoint = !state
        ? "/api/reactions/delete"
        : "/api/reactions/publish";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          castHash: data.id,
          type: event === "recasted" ? "recast" : "like",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }

      trackEvent(event, {
        user: user?.username,
        castHash: data.id,
      });
    } catch (error) {
      console.error(error);
      if (event === "recasted") {
        setRecasted(!state);
      } else {
        setLiked(!state);
      }
    }
  };

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

  useEffect(() => {
    if (!active) setPaused(false);
  }, [active]);

  return (
    <div className="relative h-screen w-screen snap-start snap-always">
      <div
        onClick={handleClick}
        onDoubleClick={() => {
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(undefined);
          }
          if (!liked) handleInteraction("double_tap_like", true);
        }}
        className="h-full w-full"
      >
        <MediaPlayer
          aspectRatio="9 / 16"
          src={data.video_url}
          streamType="on-demand"
          load={preload ? "eager" : "idle"}
          preload={preload ? "auto" : "none"}
          playsInline
          loop
          autoPlay={active}
          paused={!active || paused}
          onAutoPlayFail={() => setPaused(true)}
          fullscreenOrientation="none"
          autoFocus={false}
          className="h-full w-full object-cover"
        >
          <MediaProvider />
          <div
            className="absolute flex justify-center bottom-3 left-0 right-0 w-full z-10"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <PlaybackSlider />
          </div>
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

      <Caption data={data} />
      <InteractionButtons
        data={data}
        handleInteraction={handleInteraction}
        liked={liked}
        recasted={recasted}
      />
    </div>
  );
};

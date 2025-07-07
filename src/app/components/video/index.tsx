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
import { PlayIcon, FastForwardIcon } from "@phosphor-icons/react";
import { useEffect, useState, useRef } from "react";
import sdk from "@farcaster/frame-sdk";
import { useSigner } from "@/providers/SignerProvider";
import { PlaybackSlider } from "./components/playback-slider";
import { Profile } from "../profile";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { motion, AnimatePresence } from "motion/react";
import { Loader } from "lucide-react";
import { fetcher } from "@/utils/fetcher";

interface VideoItemProps {
  data: VideoData;
  active: boolean;
  preload: boolean;
  isScrolling?: boolean;
  disableProfile?: boolean;
  render?: boolean;
}

export const VideoItem = ({
  data,
  active,
  preload,
  isScrolling = false,
  disableProfile = false,
  render = true,
}: VideoItemProps) => {
  const { trackEvent } = useAnalytics();
  const { user, sessionToken } = useFrame();
  const { verifySigner } = useSigner();
  const [paused, setPaused] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [liked, setLiked] = useState(data.viewerContext?.liked || false);
  const [recasted, setRecasted] = useState(
    data.viewerContext?.recasted || false
  );
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout>();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [viewed, setViewed] = useState(false);
  const [tracked, setTracked] = useState(false);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [isHolding, setIsHolding] = useState(false);
  const [holdTimeout, setHoldTimeout] = useState<NodeJS.Timeout>();
  const playerRef = useRef<MediaPlayerInstance>(null);

  const { data: authorData } = useSWR<User>(
    render && data.author.username && sessionToken
      ? `/api/user/handle/${data.author.username}`
      : render && data.author.fid && sessionToken
      ? `/api/user/${data.author.fid}`
      : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  const handleInteraction = async (
    event: "liked" | "recasted" | "double_tap_like",
    state: boolean
  ) => {
    const valid = await verifySigner();
    if (!valid) return;

    if (state) await sdk.haptics.impactOccurred("medium");

    if (event === "recasted") {
      setRecasted(state);
      data.recastCount += state ? 1 : -1;
      if (data.viewerContext) {
        data.viewerContext.recasted = state;
      }
    } else {
      setLiked(state);
      data.likeCount += state ? 1 : -1;
      if (data.viewerContext) {
        data.viewerContext.liked = state;
      }
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
        data.recastCount += state ? -1 : 1;
        if (data.viewerContext) {
          data.viewerContext.recasted = !state;
        }
      } else {
        setLiked(!state);
        data.likeCount += state ? -1 : 1;
        if (data.viewerContext) {
          data.viewerContext.liked = !state;
        }
      }
    }
  };

  const handleHoldStart = () => {
    if (holdTimeout) {
      clearTimeout(holdTimeout);
    }

    const timeout = setTimeout(async () => {
      setIsHolding(true);
      setPlaybackRate(2);
      setPaused(false);

      if (playerRef.current) {
        playerRef.current.playbackRate = 2;
      }

      await sdk.haptics.impactOccurred("medium");

      trackEvent("hold_for_2x_speed", {
        user: user?.username,
        castHash: data.id,
      });
    }, 300);

    setHoldTimeout(timeout);
  };

  const handleHoldEnd = async () => {
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      setHoldTimeout(undefined);
    }

    if (isHolding) {
      setIsHolding(false);
      setPlaybackRate(1);

      if (playerRef.current) {
        playerRef.current.playbackRate = 1;
      }

      await sdk.haptics.impactOccurred("light");
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

  const handleOpenProfile = () => {
    setIsProfileOpen(true);

    trackEvent("opened_user_profile", {
      user: user?.username,
      target: data.author.username,
    });
  };

  useEffect(() => {
    if (!active) {
      setPaused(false);
      // Reset playback rate when video becomes inactive
      setIsHolding(false);
      setPlaybackRate(1);
      if (playerRef.current) {
        playerRef.current.playbackRate = 1;
      }
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        setHoldTimeout(undefined);
      }
      if (viewed && !tracked) {
        fetch("/api/track/view", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            castHash: data.id,
            channelId: data.channelId,
          }),
        });
        setTracked(true);
      }
    } else {
      setViewed(true);
    }
  }, [active, holdTimeout]);

  if (!render) {
    return (
      <div className="relative h-full w-screen max-h-[calc(100vh-64px)] snap-start snap-always bg-black" />
    );
  }

  return (
    <>
      <div className="relative h-full w-screen max-h-[calc(100vh-64px)] snap-start snap-always">
        <motion.div
          className="absolute inset-0"
          animate={{
            x: isProfileOpen ? "-50%" : "0%",
            opacity: isProfileOpen ? 0 : 1,
          }}
          transition={{
            type: "tween",
            duration: 0.15,
            ease: "easeInOut",
            opacity: { duration: 0.15 },
          }}
        >
          <div
            onClick={handleClick}
            onDoubleClick={() => {
              if (clickTimeout) {
                clearTimeout(clickTimeout);
                setClickTimeout(undefined);
              }
              if (!liked) handleInteraction("double_tap_like", true);
            }}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className="h-full w-full"
          >
            <MediaPlayer
              ref={playerRef}
              aspectRatio="9 / 16"
              src={data.video_url}
              streamType="on-demand"
              load={preload ? "eager" : "idle"}
              preload={preload ? "auto" : "none"}
              playsInline
              loop
              autoPlay={active}
              paused={isProfileOpen || !active || paused}
              playbackRate={playbackRate}
              onAutoPlayFail={() => setPaused(true)}
              onCanPlay={() => setBuffering(false)}
              onLoadStart={() => setBuffering(true)}
              onLoadedData={() => setBuffering(false)}
              fullscreenOrientation="none"
              autoFocus={false}
              className="h-full w-full object-cover"
            >
              <MediaProvider />
              <div
                className={`absolute flex justify-center bottom-0 left-0 right-0 w-full z-10 ${
                  isScrolling ? "opacity-70" : "opacity-100"
                } transition-opacity duration-200`}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
              >
                <PlaybackSlider />
              </div>
            </MediaPlayer>
            {paused ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayIcon
                  weight="fill"
                  size={48}
                  className="text-white opacity-70 cursor-pointer hover:opacity-90"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center"></div>
            )}
          </div>

          <AnimatePresence>
            {isHolding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 left-0 right-0 flex justify-center"
              >
                <div className="bg-black bg-opacity-60 rounded-lg px-3 py-1">
                  <div className="flex items-center gap-2">
                    <FastForwardIcon
                      weight="fill"
                      size={18}
                      className="text-white"
                    />
                    <span className="text-white font-semibold text-lg">2x</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`transition-opacity duration-200 ${
              isScrolling ? "opacity-70" : "opacity-100"
            }`}
          >
            <Caption data={data} />
            <InteractionButtons
              data={data}
              handleInteraction={handleInteraction}
              liked={liked}
              recasted={recasted}
              openProfile={handleOpenProfile}
              disableProfile={disableProfile}
            />
          </div>
        </motion.div>
        {buffering && active && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader className="w-4 h-4 animate-spin text-white" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isProfileOpen && (
          <Profile
            user={authorData || null}
            onClose={() => setIsProfileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

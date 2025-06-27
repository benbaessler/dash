"use client";
import { Caption } from "./components/caption";
import { InteractionButtons } from "./components/interaction-buttons";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFrame } from "@/providers/FrameProvider";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlayIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { useSigner } from "@/providers/SignerProvider";
import { PlaybackSlider } from "./components/playback-slider";
import { Profile } from "../profile";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";

interface VideoItemProps {
  data: VideoData;
  active: boolean;
  preload: boolean;
  isScrolling?: boolean;
  disableProfile?: boolean;
  render?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const [liked, setLiked] = useState(data.viewerContext?.liked || false);
  const [recasted, setRecasted] = useState(
    data.viewerContext?.recasted || false
  );
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout>();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: authorData } = useSWR<User>(
    render && data.author.username && user?.fid
      ? `/api/user/handle/${data.author.username}?viewerFid=${user?.fid}`
      : render && data.author.fid && user?.fid
      ? `/api/user/${data.author.fid}?viewerFid=${user?.fid}`
      : null,
    fetcher,
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

    await sdk.haptics.impactOccurred("medium");

    if (event === "recasted") {
      setRecasted(state);
      data.recastCount += state ? 1 : -1;
      data.viewerContext!.recasted = state;
    } else {
      setLiked(state);
      data.likeCount += state ? 1 : -1;
      data.viewerContext!.liked = state;
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
        data.viewerContext!.recasted = !state;
      } else {
        setLiked(!state);
        data.likeCount += state ? -1 : 1;
        data.viewerContext!.liked = !state;
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

  if (!render) {
    return (
      <div className="relative h-full w-screen max-h-[calc(100vh-64px)] snap-start snap-always bg-black" />
    );
  }

  return (
    <>
      <div className="relative h-full w-screen max-h-[calc(100vh-64px)] snap-start snap-always">
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
            paused={isProfileOpen || !active || paused}
            onAutoPlayFail={() => setPaused(true)}
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
            openProfile={() => setIsProfileOpen(true)}
            disableProfile={disableProfile}
          />
        </div>
      </div>
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black z-[10]">
          <Profile
            user={authorData || null}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      )}
    </>
  );
};

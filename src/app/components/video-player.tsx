"use client";
import { useEffect, useMemo, useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { InteractionButtons } from "./interaction-buttons";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { useSigner } from "@/hooks/useSigner";
import { ReactionType } from "@neynar/nodejs-sdk/build/api";

interface VideoPlayerProps {
  post: Post;
  isActive: boolean;
  handleApproveSigner: () => Promise<void>;
  loading: boolean;
}

export function VideoPlayer({
  post,
  isActive,
  handleApproveSigner,
  loading,
}: VideoPlayerProps) {
  const [ref, inView] = useInView({
    threshold: 0.9,
  });
  const [liked, setLiked] = useState(false);
  const [recasted, setRecasted] = useState(false);
  const [playTimeout, setPlayTimeout] = useState<NodeJS.Timeout | null>(null);
  const [paused, setPaused] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const { signer } = useSigner();
  const [, setForceUpdate] = useState(0);

  // Add effect to monitor signer changes
  useEffect(() => {
    if (signer?.status === "approved") {
      setForceUpdate((prev) => prev + 1);
    }
  }, [signer]);

  const idle = useMemo(() => {
    return !inView || !isActive || loading;
  }, [inView, isActive, loading]);

  const handleInteraction = async (e: React.MouseEvent, type: ReactionType) => {
    e.stopPropagation();
    if (!signer || signer.status !== "approved") {
      await handleApproveSigner();
      return;
    }

    const castHash = post.id;
    const previousLiked = liked;
    const previousRecasted = recasted;

    // Update local state
    if (type === "like") {
      setLiked(!liked);
    } else if (type === "recast") {
      setRecasted(!recasted);
    }

    try {
      const isRemoving =
        (type === "like" && previousLiked) ||
        (type === "recast" && previousRecasted);
      const endpoint = isRemoving
        ? "/api/reactions/delete"
        : "/api/reactions/publish";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          castHash,
          type,
          signerUuid: signer.signer_uuid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }
    } catch (error) {
      // Revert state if API call fails
      if (type === "like") {
        setLiked(previousLiked);
      } else if (type === "recast") {
        setRecasted(previousRecasted);
      }
      console.error("Failed to update reaction:", error);
    }
  };

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
      onDoubleClick={(e) => {
        if (!liked) handleInteraction(e, "like");
      }}
    >
      <MediaPlayer
        className="w-full h-full"
        aspectRatio="9 / 16"
        src={post.video_url}
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
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="animate-spin" />
        </div>
      )}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <InteractionButtons
          post={post}
          liked={liked}
          recasted={recasted}
          handleInteraction={handleInteraction}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-6 py-8 mr-16 w-full overflow-hidden">
        <div className="flex flex-col w-full">
          <div className="text-white font-semibold truncate">
            {post.author.displayName}
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
              {post.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

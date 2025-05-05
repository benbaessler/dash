import { ArrowPathIcon, HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
import { useState } from "react";
import { useSigner } from "@/providers/SignerProvider";
import { FarcasterIcon } from "@/assets/icons";

interface InteractionButtonsProps {
  post: Post;
  liked: boolean;
  recasted: boolean;
  handleInteraction: (e: React.MouseEvent, type: "like" | "recast") => void;
}

export const InteractionButtons = ({
  post,
  liked,
  recasted,
  handleInteraction,
}: InteractionButtonsProps) => {
  const { loading } = useSigner();
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="relative w-10 h-10">
        {isImageLoading && (
          <div className="absolute inset-0 w-10 h-10 rounded-full bg-white animate-pulse" />
        )}
        <Image
          src={post.author.pfpUrl ?? ""}
          alt={post.author.displayName ?? ""}
          width={38}
          height={38}
          className={`w-10 h-10 rounded-full object-cover cursor-pointer ${
            isImageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoadingComplete={() => setIsImageLoading(false)}
          onClick={async (e) => {
            e.stopPropagation();
            await sdk.actions.viewProfile({ fid: post.author.fid });
          }}
        />
      </div>
      <div className="flex flex-col items-center text-slate-200">
        <HeartIcon
          className={`size-9 cursor-pointer hover:opacity-100 ${
            loading ? "opacity-50" : liked ? "opacity-100" : "opacity-80"
          } ${liked ? "text-red-500 animate-heartbeat" : ""}`}
          onClick={(e) => handleInteraction(e, "like")}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <span className="text-sm font-medium">{post.likeCount}</span>
      </div>
      <div className="flex flex-col items-center text-slate-200">
        <ArrowPathIcon
          className={`size-9 cursor-pointer hover:opacity-100 ${
            loading ? "opacity-50" : recasted ? "opacity-100" : "opacity-80"
          } ${recasted ? "text-green-500 animate-heartbeat" : ""}`}
          onClick={(e) => handleInteraction(e, "recast")}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <span className="text-sm font-medium">{post.recastCount}</span>
      </div>
      <div className="flex flex-col items-center text-slate-200">
        <ChatBubbleOvalLeftIcon
          className={`size-9 cursor-pointer hover:opacity-100 ${
            loading ? "opacity-50" : recasted ? "opacity-100" : "opacity-80"
          } ${recasted ? "text-green-500 animate-heartbeat" : ""}`}
          onClick={(e) => handleInteraction(e, "recast")}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <span className="text-sm font-medium">{post.commentCount}</span>
      </div>
      <div
        className="w-9 h-9 opacity-80 hover:opacity-100 cursor-pointer rounded-full"
        onClick={() => {
          sdk.actions.openUrl(
            `https://warpcast.com/${post.author.username}/${post.id}`
          );
        }}
      >
        <FarcasterIcon className="size-9" />
      </div>
    </div>
  );
};

import {
  ArrowPathIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/solid";
import sdk from "@farcaster/frame-sdk";
import { useSigner } from "@/providers/SignerProvider";
import { FarcasterIcon } from "@/assets/icons";
import { CommentSection } from "./comment-section";
import { Avatar } from "./avatar";
import { ReactNode } from "react";

interface InteractionButtonsProps {
  post: Post;
  liked: boolean;
  recasted: boolean;
  handleInteraction: (e: React.MouseEvent, type: "like" | "recast") => void;
}

interface InteractionButtonProps {
  icon: ReactNode;
  count?: number;
  isActive?: boolean;
  activeColor?: string;
  isLoading: boolean;
  onClick?: (e: React.MouseEvent) => void;
  wrapper?: (children: ReactNode) => ReactNode;
}

const InteractionButton = ({
  icon,
  count,
  isActive = false,
  activeColor = "",
  isLoading,
  onClick,
  wrapper = (children) => children,
}: InteractionButtonProps) => {
  return wrapper(
    <div
      className={`flex cursor-pointer flex-col items-center text-sm font-medium hover:opacity-100 ${
        isLoading ? "opacity-50" : isActive ? "opacity-100" : "opacity-90"
      }`}
    >
      <div
        className={`size-9 ${isActive ? `${activeColor} animate-heartbeat` : ""}`}
        onClick={onClick}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {icon}
      </div>
      {count && <span>{count}</span>}
    </div>
  );
};

export const InteractionButtons = ({
  post,
  liked,
  recasted,
  handleInteraction,
}: InteractionButtonsProps) => {
  const { loading } = useSigner();

  return (
    <div className="flex flex-col gap-5 items-center text-white drop-shadow-sm z-10">
      <Avatar
        imageUrl={post.author.pfpUrl ?? ""} 
        altText={post.author.displayName ?? ""}
        fid={post.author.fid}
        className="w-10 h-10"
      />

      <InteractionButton
        icon={<HeartIcon className="size-9" />}
        count={post.likeCount}
        isActive={liked}
        activeColor="text-red-500"
        isLoading={loading}
        onClick={(e) => handleInteraction(e, "like")}
      />

      <InteractionButton
        icon={<ChatBubbleOvalLeftIcon className="size-9" />}
        count={post.commentCount}
        isLoading={loading}
        wrapper={(children) => (
          <CommentSection castHash={post.id}>{children}</CommentSection>
        )}
      />

      <InteractionButton
        icon={<ArrowPathIcon className="size-9" />}
        count={post.recastCount}
        isActive={recasted}
        activeColor="text-green-500"
        isLoading={loading}
        onClick={(e) => handleInteraction(e, "recast")}
      />

      <InteractionButton
        icon={<FarcasterIcon className="size-9" />}
        isLoading={loading}
        onClick={() => {
          sdk.actions.openUrl(
            `https://warpcast.com/${post.author.username}/${post.id}`
          );
        }}
      />
    </div>
  );
};

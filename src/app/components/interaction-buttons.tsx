import {
  ArrowPathIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/solid";
import { useSigner } from "@/providers/SignerProvider";
import { CommentSection } from "./comment-section";
import { Avatar } from "./avatar";
import { ReactNode } from "react";
import { Share } from "./share";

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
        className={`size-9 mx-auto ${
          isActive ? `${activeColor} animate-heartbeat` : ""
        }`}
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
        icon={<HeartIcon />}
        count={post.likeCount}
        isActive={liked}
        activeColor="text-red-500"
        isLoading={loading}
        onClick={(e) => handleInteraction(e, "like")}
      />

      <InteractionButton
        icon={<ArrowPathIcon />}
        count={post.recastCount}
        isActive={recasted}
        activeColor="text-green-500"
        isLoading={loading}
        onClick={(e) => handleInteraction(e, "recast")}
      />

      <InteractionButton
        icon={<ChatBubbleOvalLeftIcon />}
        count={post.commentCount}
        isLoading={loading}
        wrapper={(children) => (
          <CommentSection castHash={post.id}>{children}</CommentSection>
        )}
      />

      <InteractionButton
        icon={<ArrowUpTrayIcon />}
        isLoading={loading}
        wrapper={(children) => (
          <Share post={post}>{children}</Share>
        )}
      />
    </div>
  );
};

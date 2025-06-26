import {
  ShareFatIcon,
  HeartIcon,
  ChatTeardropTextIcon,
  RepeatIcon,
} from "@phosphor-icons/react";
import { CommentSection } from "./comment-section";
import { Avatar } from "./avatar";
import { ReactNode } from "react";
import { Share } from "./share";

interface InteractionButtonsProps {
  data: VideoData;
  handleInteraction: (
    event: "liked" | "recasted" | "double_tap_like",
    state: boolean
  ) => void;
  liked: boolean;
  recasted: boolean;
}

export const InteractionButtons = ({
  data,
  handleInteraction,
  liked,
  recasted,
}: InteractionButtonsProps) => {
  return (
    <div className="absolute bottom-10 right-4 flex flex-col gap-5 items-center text-white drop-shadow-sm z-10">
      <Avatar user={data.author} className="w-10 h-10" />

      <InteractionButton
        icon={<HeartIcon size={35} weight="fill" />}
        count={data.likeCount}
        isActive={liked}
        activeColor="text-red-500"
        onClick={() => handleInteraction("liked", !liked)}
      />

      <InteractionButton
        icon={<ChatTeardropTextIcon size={35} weight="fill" />}
        count={data.commentCount}
        wrapper={(children) => (
          <CommentSection castHash={data.id}>{children}</CommentSection>
        )}
      />

      <InteractionButton
        icon={<RepeatIcon size={35} />}
        count={data.recastCount}
        isActive={recasted}
        activeColor="text-green-500"
        onClick={() => handleInteraction("recasted", !recasted)}
      />

      <InteractionButton
        icon={<ShareFatIcon size={35} weight="fill" />}
        wrapper={(children) => <Share data={data}>{children}</Share>}
      />
    </div>
  );
};

interface InteractionButtonProps {
  icon: ReactNode;
  count?: number;
  isActive?: boolean;
  activeColor?: string;
  onClick?: (e: React.MouseEvent) => void;
  wrapper?: (children: ReactNode) => ReactNode;
}

const InteractionButton = ({
  icon,
  count,
  isActive = false,
  activeColor = "",
  onClick,
  wrapper = (children) => children,
}: InteractionButtonProps) => {
  return wrapper(
    <div
      className={`flex cursor-pointer flex-col items-center text-sm font-medium hover:opacity-100 ${
        isActive ? "opacity-100" : "opacity-90"
      }`}
    >
      <div
        className={`size-9 mx-auto ${
          isActive ? `${activeColor} animate-heartbeat` : ""
        }`}
        onClick={onClick}
      >
        {icon}
      </div>
      {count && <span>{count}</span>}
    </div>
  );
};

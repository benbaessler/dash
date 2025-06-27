import Image from "next/image";
import { memo } from "react";

interface AvatarProps {
  user: VideoData["author"];
  onClick?: () => void;
  className?: string;
  isComment?: boolean;
}


const AvatarComponent = ({
  user,
  onClick = () => {},
  className = "w-10 h-10",
  isComment = false,
}: AvatarProps) => (
  <div className={`relative aspect-square ${className}`}>
    <Image
      priority={!isComment}
      src={user.pfpUrl}
      alt={user.displayName}
      fill
      sizes="45px"
      className={`rounded-full object-cover ${
        user.username || user.fid ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    />
  </div>
);

export const Avatar = memo(AvatarComponent);

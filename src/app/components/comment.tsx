import Image from "next/image";
import { Heart } from "lucide-react";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import sdk from "@farcaster/frame-sdk";

export const Comment = ({ comment }: { comment: any }) => {
  return (
    <div className="flex gap-3">
      <div
        className="flex-shrink-0 w-8 h-8 cursor-pointer"
        onClick={() => {
          sdk.actions.viewProfile({
            fid: comment.author.fid,
          });
        }}
      >
        <Image
          src={comment.author.pfp_url}
          alt={comment.author.display_name}
          className="w-full h-full rounded-full object-cover"
          width={28}
          height={28}
        />
      </div>
      <div className="flex-grow text-xs">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          {comment.author.display_name}
        </div>
        <p className="mb-1 text-sm">{comment.text}</p>
        <div className="flex items-center justify-between text-slate-500 w-full mt-1">
          <span className="text-xs">
            {formatTimeAgo(
              Math.floor(new Date(comment.timestamp).getTime() / 1000)
            )}
          </span>
          <div className="flex items-center gap-1 cursor-pointer text-slate-400 hover:text-slate-200">
            <Heart size={14} />
            <span className="text-xs">{comment.reactions.likes_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

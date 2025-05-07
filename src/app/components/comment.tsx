import Image from "next/image";
import {
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import sdk from "@farcaster/frame-sdk";
import { useState } from "react";

export const Comment = ({
  comment,
  isReplyItem = false,
}: {
  comment: any;
  isReplyItem?: boolean;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between w-full">
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                {comment.author.display_name}
              </div>
              <span className="text-xs text-gray-500 font-normal">
                {formatTimeAgo(
                  Math.floor(new Date(comment.timestamp).getTime() / 1000)
                )}
              </span>
            </div>
            <p
              className={`text-sm break-words ${
                !isTextExpanded ? "line-clamp-3" : ""
              } cursor-pointer`}
              onClick={() => setIsTextExpanded(!isTextExpanded)}
            >
              {comment.text}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-gray-300">
          <HeartIcon className="size-4" />
          <span className="text-xs">{comment.reactions.likes_count}</span>
        </div>
      </div>
      <div className="ml-10">
        {comment.replies.count > 0 && !showReplies && !isReplyItem && (
          <div
            className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 flex items-center font-medium"
            onClick={() => setShowReplies(!showReplies)}
          >
            <ChevronDownIcon className="size-3 mr-1" />
            View {comment.replies.count}{" "}
            {comment.replies.count === 1 ? "reply" : "replies"}
          </div>
        )}
        {showReplies &&
          comment.direct_replies &&
          comment.direct_replies.length > 0 && (
            <div className="space-y-2">
              {comment.direct_replies.slice(0, 5).map((reply: any) => (
                <Comment key={reply.hash} comment={reply} isReplyItem={true} />
              ))}
            </div>
          )}
        {comment.replies.count > 0 && showReplies && !isReplyItem && (
          <div
            className="text-xs text-slate-400 mt-2 cursor-pointer hover:text-slate-300 flex items-center font-medium"
            onClick={() => setShowReplies(!showReplies)}
          >
            <ChevronUpIcon className="size-3 mr-1" />
            Hide
          </div>
        )}
      </div>
    </div>
  );
};

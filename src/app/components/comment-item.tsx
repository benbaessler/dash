import {
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { useState } from "react";
import { Avatar } from "./avatar";

export const CommentItem = ({
  comment,
  isReplyItem = false,
}: {
  comment: CommentData;
  isReplyItem?: boolean;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between w-full">
        <div className="flex gap-3 min-w-0">
          <Avatar
            imageUrl={comment.author.pfp_url}
            altText={comment.author.display_name}
            className={isReplyItem ? "w-6 h-6" : "w-8 h-8"}
            fid={comment.author.fid}
          />
          <div className="flex-grow text-xs min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300 truncate">
                <span className="truncate">{comment.author.display_name}</span>
              </div>
              <span className="text-xs text-gray-500 font-normal flex-shrink-0">
                {formatTimeAgo(
                  Math.floor(new Date(comment.timestamp).getTime() / 1000)
                )}
              </span>
            </div>
            <p
              className={`text-base break-words ${
                !isTextExpanded ? "line-clamp-3" : ""
              } cursor-pointer`}
              onClick={() => setIsTextExpanded(!isTextExpanded)}
            >
              {comment.text}
            </p>
            <div className="flex items-center gap-1 text-gray-400 hover:text-gray-300 cursor-pointer mt-2">
              <HeartIcon className="size-5" />
              <span className="text-sm font-medium">{comment.reactions.likes_count}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ml-10">
        {comment.replies.count > 0 && !showReplies && !isReplyItem && (
          <div
            className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center font-medium"
            onClick={() => setShowReplies(!showReplies)}
          >
            <ChevronDownIcon className="size-4 mr-1 font-bold" />
            View {comment.replies.count}{" "}
            {comment.replies.count === 1 ? "reply" : "replies"}
          </div>
        )}
        {showReplies &&
          comment.direct_replies &&
          comment.direct_replies.length > 0 && (
            <div className="space-y-2 mt-2">
              {comment.direct_replies.slice(0, 5).map((reply: Comment) => (
                <Comment key={reply.hash} comment={reply} isReplyItem={true} />
              ))}
            </div>
          )}
        {comment.replies.count > 0 && showReplies && !isReplyItem && (
          <div
            className="text-sm text-gray-400 mt-2 cursor-pointer hover:text-gray-300 flex items-center font-medium"
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

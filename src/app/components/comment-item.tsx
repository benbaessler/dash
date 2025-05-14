import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatTimeAgo } from "@/utils/formatTime";
import { useState, useEffect } from "react";
import { Avatar } from "./avatar";
import { usePost } from "@/hooks/usePost";
import { useFrame } from "@/providers/FrameProvider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const CommentItem = ({
  comment,
  isReplyItem = false,
  handleSelectComment,
}: {
  comment: CommentData;
  isReplyItem?: boolean;
  handleSelectComment?: () => void;
}) => {
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    comment.isExpanded ? `replies-${comment.hash}` : undefined
  );
  const { checkAuth } = usePost();
  const { sessionToken } = useFrame();
  
  useEffect(() => {
    if (comment.isExpanded) {
      setAccordionValue(`replies-${comment.hash}`);
    }
  }, [comment.isExpanded, comment.hash]);

  const likeComment = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const authorized = await checkAuth();
    if (!authorized) return;

    // Optimistic update
    setIsLiked(!isLiked);
    const initialLikesCount = comment.reactions.likes_count;
    comment.reactions.likes_count = isLiked
      ? initialLikesCount - 1
      : initialLikesCount + 1;

    try {
      const endpoint = isLiked
        ? "/api/reactions/delete"
        : "/api/reactions/publish";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          castHash: comment.hash,
          type: "like",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      comment.reactions.likes_count = initialLikesCount;
      console.error("Failed to update reaction:", error);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeComment();
  };

  return (
    <div className="flex flex-col gap-2 w-full" onDoubleClick={handleDoubleClick}>
      <div className="flex justify-between w-full">
        <div className="flex gap-3 min-w-0">
          <Avatar
            imageUrl={comment.author.pfp_url}
            altText={comment.author.display_name}
            className={isReplyItem ? "w-6 h-6" : "w-8 h-8"}
            fid={comment.author.fid}
          />
          <div className="flex-grow text-sm min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold">
                {comment.author.display_name}
              </span>
              <span className="text-xs text-gray-500 font-normal flex-shrink-0">
                {formatTimeAgo(
                  Math.floor(new Date(comment.timestamp).getTime() / 1000)
                )}
              </span>
            </div>
            <p
              className={`text-base w-full break-words ${
                !isTextExpanded ? "line-clamp-3" : ""
              } cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                setIsTextExpanded(!isTextExpanded);
              }}
            >
              {comment.text}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div
                className="flex items-center gap-1 text-gray-400 hover:text-gray-300 cursor-pointer"
                onClick={(e) => likeComment(e)}
              >
                {isLiked ? (
                  <HeartIconSolid className="size-5 text-red-500 animate-heartbeat" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span className="text-sm font-medium">
                  {comment.reactions.likes_count}
                </span>
              </div>
              {/* {!isReplyItem && (
                <span
                  className="text-sm font-medium text-gray-400 hover:text-gray-300 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectComment?.();
                  }}
                >
                  Reply
                </span>
              )} */}
            </div>
          </div>
        </div>
      </div>
      {/* <div className="ml-10">
        {comment.replies.count > 0 && !isReplyItem && (
          <>
            <Accordion
              type="single"
              collapsible
              className="border-0"
              value={accordionValue}
              onValueChange={setAccordionValue}
            >
              <AccordionItem
                value={`replies-${comment.hash}`}
                className="border-0"
                id={`comment-${comment.hash}`}
              >
                <AccordionTrigger className="py-2 text-sm text-gray-400 hover:text-gray-300 font-medium">
                  {accordionValue
                    ? `Hide`
                    : `View ${comment.replies.count} ${
                        comment.replies.count === 1 ? "reply" : "replies"
                      }`}
                </AccordionTrigger>
                <AccordionContent>
                  {comment.direct_replies &&
                    comment.direct_replies.length > 0 && (
                      <div className="space-y-2">
                        {(
                          comment.direct_replies as unknown as CommentData[]
                        ).map((reply: CommentData) => (
                          <CommentItem
                            key={reply.hash}
                            comment={reply}
                            isReplyItem={true}
                            handleSelectComment={handleSelectComment}
                          />
                        ))}
                      </div>
                    )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </div> */}
    </div>
  );
};

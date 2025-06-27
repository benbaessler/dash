import { HeartIcon } from "@phosphor-icons/react";
import { formatTimeAgo } from "@/utils/formatTime";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Avatar } from "./avatar";
import { useFrame } from "@/providers/FrameProvider";
import { ClickableText } from "@/app/components/common/text";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSigner } from "@/providers/SignerProvider";
import sdk from "@farcaster/frame-sdk";

export const CommentItem = memo(({ comment }: { comment: CommentData }) => {
  const { author, hash, reactions, text, timestamp, isExpanded } = comment;
  const [isTextExpanded, setIsTextExpanded] = useState(isExpanded || false);
  const [isLiked, setIsLiked] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const { sessionToken, context } = useFrame();
  const { verifySigner } = useSigner();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current;
      setIsTextTruncated(scrollHeight > clientHeight);
    }
  }, [text]);

  const likeComment = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      const authorized = await verifySigner();
      if (!authorized) return;

      // Optimistic update
      setIsLiked((prev) => !prev);
      const initialLikesCount = reactions.likes_count;
      comment.reactions.likes_count = !isLiked
        ? initialLikesCount + 1
        : initialLikesCount - 1;

      try {
        const endpoint = !isLiked
          ? "/api/reactions/publish"
          : "/api/reactions/delete";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            castHash: hash,
            type: "like",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update reaction");
        }

        trackEvent("liked_comment", {
          user: context?.user.username,
          castHash: hash,
        });
      } catch (error) {
        // Revert optimistic update on error
        setIsLiked((prev) => !prev);
        comment.reactions.likes_count = initialLikesCount;
        console.error("Failed to update reaction:", error);
      }
    },
    [
      verifySigner,
      isLiked,
      reactions,
      comment,
      sessionToken,
      hash,
      trackEvent,
      context,
    ]
  );

  const toggleTextExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTextExpanded(!isTextExpanded);
  };

  return (
    <div
      className="flex flex-col gap-2 w-full"
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!comment.hash.startsWith("temp-")) likeComment();
      }}
    >
      <div className="flex justify-between w-full">
        <div className="flex gap-3 min-w-0">
          <Avatar
            user={{
              fid: author.fid,
              pfpUrl: author.pfp_url,
              displayName: author.display_name,
              username: author.username,
            }}
            onClick={() => sdk.actions.viewProfile({ fid: author.fid })}
            isComment
          />
          <div className="flex-grow text-sm min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold">
                {author.display_name}
              </span>
              <span className="text-xs text-gray-500 font-normal flex-shrink-0">
                {formatTimeAgo(
                  Math.floor(new Date(timestamp).getTime() / 1000)
                )}
              </span>
            </div>
            <div
              ref={textRef}
              className={`text-base w-full break-words ${
                !isTextExpanded ? "line-clamp-3" : ""
              } cursor-pointer`}
              onClick={toggleTextExpansion}
            >
              <ClickableText text={text} />
            </div>
            {isTextTruncated && (
              <div
                className="opacity-60 hover:opacity-80 text-sm font-medium mt-1 cursor-pointer"
                onClick={toggleTextExpansion}
              >
                {isTextExpanded ? "Show less" : "Show more"}
              </div>
            )}
            {!comment.hash.startsWith("temp-") && (
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-300 cursor-pointer"
                  onClick={(e) => likeComment(e)}
                >
                  {isLiked ? (
                    <HeartIcon
                      weight="fill"
                      size={20}
                      className="text-red-500 animate-heartbeat"
                    />
                  ) : (
                    <HeartIcon weight="regular" size={20} />
                  )}
                  <span className="text-sm font-medium">
                    {reactions.likes_count}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

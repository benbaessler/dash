import { useEffect, useState, useRef, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { Loader } from "lucide-react";
import { CommentItem } from "./comment-item";
import { Input } from "@/components/ui/input";
import { Avatar } from "./avatar";
import { useFrame } from "@/providers/FrameProvider";
import { usePost } from "@/hooks/usePost";
import { appUrl } from "@/constants";

interface CommentSectionProps {
  children: React.ReactNode;
  castHash: string;
}

export const CommentSection = ({ children, castHash }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, sessionToken } = useFrame();
  const { checkAuth } = usePost();

  const handleCommentSelect = (comment: CommentData) => {
    setReplyingTo(comment);
    const commentId = `comment-${comment.hash}`;
    const commentElement = document.getElementById(commentId);

    if (commentElement && scrollableContainerRef.current) {
      commentElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      inputRef.current?.focus();
    }
  };

  const fetchComments = useCallback(
    async (cursor?: string) => {
      setLoading(true);

      try {
        const url = new URL(`/api/comments`, appUrl);
        url.searchParams.append("hash", castHash);
        if (cursor) {
          url.searchParams.append("cursor", cursor);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        console.log("API Response:", data);

        const commentData = data.comments || [];
        console.log("Comment data:", commentData);

        if (cursor) {
          setComments((prev) => [...prev, ...commentData]);
        } else {
          setComments(commentData);
        }

        setNextCursor(data.cursor || null);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    },
    [castHash]
  );

  const postComment = async (parentHash: string, textToPost: string) => {
    if (!user || !user.fid) {
      console.error(
        "User data (including FID) is not available. Cannot post comment."
      );
      return;
    }

    const authorized = await checkAuth();
    if (!authorized) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentData = {
      hash: tempId,
      author: {
        fid: user.fid,
        pfp_url: user.pfp_url ?? "",
        display_name: user.display_name ?? "You",
      },
      timestamp: new Date().toISOString(),
      text: textToPost,
      reactions: {
        likes_count: 0,
      },
      replies: {
        count: 0,
      },
    };

    setCommentText("");
    inputRef.current?.blur();

    if (parentHash === castHash) {
      setComments((prevComments) => [optimisticComment, ...prevComments]);
      if (scrollableContainerRef.current)
        scrollableContainerRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
    } else {
      const parentCast = comments.find((c) => c.hash === parentHash);
      if (parentCast) {
        parentCast.replies.count++;
        if (!parentCast.direct_replies) {
          parentCast.direct_replies = [];
        }
        parentCast.direct_replies = [
          optimisticComment,
          ...(parentCast.direct_replies || []),
        ];

        parentCast.isExpanded = true;

        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.hash === parentHash ? parentCast : comment
          )
        );
      }
    }

    try {
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          text: textToPost,
          castHash: parentHash,
        }),
      });

      if (!response.ok) {
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || JSON.stringify(errorData);
        } catch {
          errorDetails = response.statusText || errorDetails;
        }
        throw new Error(`Failed to post comment: ${errorDetails}`);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      if (parentHash === castHash) {
        setComments((prevComments) =>
          prevComments.filter((c) => c.hash !== tempId)
        );
      } else {
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.hash === parentHash) {
              return {
                ...comment,
                replies: {
                  ...comment.replies,
                  count: comment.replies.count - 1,
                },
                direct_replies:
                  comment.direct_replies?.filter(
                    (reply) => reply.hash !== tempId
                  ) || [],
              };
            }
            return comment;
          })
        );
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  const loadMoreComments = useCallback(() => {
    if (nextCursor && !loading) {
      fetchComments(nextCursor);
    }
  }, [nextCursor, loading, fetchComments]);

  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        if (nextCursor && !loading) {
          loadMoreComments();
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [nextCursor, loading, loadMoreComments]);

  return (
    <div onDoubleClick={(e) => e.stopPropagation()}>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="h-[70vh] w-full flex flex-col pb-4">
          <DrawerHeader>
            <DrawerTitle>Comments</DrawerTitle>
          </DrawerHeader>
          <div
            ref={scrollableContainerRef}
            className="p-4 overflow-y-auto flex-grow w-full"
          >
            {loading && comments.length === 0 ? (
              <div className="flex justify-center py-4">
                <Loader className="size-4 animate-spin" />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-5 pb-4">
                {comments.map((comment) => (
                  <CommentItem
                    comment={comment}
                    key={comment.hash}
                    handleSelectComment={() => handleCommentSelect(comment)}
                  />
                ))}

                {loading && comments.length > 0 && nextCursor && (
                  <div className="flex justify-center py-4">
                    <Loader className="size-4 animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No comments yet.</p>
              </div>
            )}
          </div>
          <div className="p-4 flex items-center space-x-2">
            <Avatar
              imageUrl={user?.pfp_url ?? ""}
              altText={user?.display_name ?? ""}
              className="w-8 h-8"
            />
            <div className="relative flex-grow">
              <Input
                ref={inputRef}
                maxLength={255}
                placeholder={
                  replyingTo
                    ? `Replying to ${replyingTo.author.display_name}`
                    : "Add comment..."
                }
                className="flex-grow rounded pr-10"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    (e.relatedTarget as HTMLElement)?.id !==
                    "send-comment-button"
                  ) {
                    setReplyingTo(null);
                  }
                }}
              />
              {commentText.length > 0 && (
                <Button
                  id="send-comment-button"
                  variant="action"
                  onClick={() =>
                    postComment(
                      replyingTo ? replyingTo.hash : castHash,
                      commentText
                    )
                  }
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm w-7 h-7 font-bold p-0"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

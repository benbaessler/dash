import { useEffect, useState, useRef, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "@phosphor-icons/react";
import { CommentItem } from "./comment-item";
import { Input } from "@/components/ui/input";
import { Avatar } from "./avatar";
import { useFrame } from "@/providers/FrameProvider";
import { appUrl } from "@/constants";
import { CommentSkeleton } from "../../common/skeleton-loader";
import useSWRInfinite from "swr/infinite";
import { Loader } from "lucide-react";
import { sdk } from "@farcaster/frame-sdk";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "@/hooks/use-toast";

interface CommentSectionProps {
  children: React.ReactNode;
  castHash: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
};

export const CommentSection = ({ children, castHash }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, sessionToken, context } = useFrame();
  const { trackEvent } = useAnalytics();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getKey = (
    pageIndex: number,
    previousPageData: { data: CommentData[]; cursor?: string } | null
  ) => {
    if (!user?.fid || (previousPageData && !previousPageData.cursor))
      return null;

    const url = new URL(
      `/api/comments?viewerFid=${user?.fid}&hash=${castHash}`,
      appUrl
    );

    if (pageIndex !== 0) {
      url.searchParams.append("cursor", previousPageData?.cursor || "");
    }

    return url.toString();
  };

  const {
    data: pagesData,
    setSize,
    isLoading,
    isValidating,
    mutate,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    persistSize: true,
    revalidateAll: false,
  });

  const nextCursor = pagesData?.[pagesData.length - 1]?.cursor;

  useEffect(() => {
    if (pagesData) {
      const serverComments = pagesData.flatMap((page) => page.comments);
      setComments((prevComments) => {
        // User's comments are prefixed with "temp-"
        const tempComments = prevComments.filter((c) =>
          c.hash.startsWith("temp-")
        );
        const combined = [...tempComments, ...serverComments];
        const uniqueComments = Array.from(
          new Map(combined.map((c) => [c.hash, c])).values()
        );
        return uniqueComments;
      });
    }
  }, [pagesData]);

  const loadMore = useCallback(() => {
    const canLoadMore = nextCursor && !isLoading && !isValidating;
    if (canLoadMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [nextCursor, isLoading, isValidating, setSize]);

  const handleScroll = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const container = scrollableContainerRef.current;
      if (!container || isLoading || isValidating || !nextCursor) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= 0.8) {
        loadMore();
      }
    }, 200);
  }, [loadMore, isLoading, isValidating, nextCursor]);

  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (isOpen && container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [isOpen, handleScroll]);

  const postComment = async (parentHash: string, textToPost: string) => {
    if (!user || !user.fid) return;

    if (!sessionToken) {
      toast({
        title: "Connect your wallet",
        description: "You must connect your wallet to comment.",
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newComment: CommentData = {
      hash: tempId,
      author: {
        fid: user.fid,
        pfp_url: user.pfp_url ?? "",
        display_name: user.display_name ?? "You",
        username: user.username ?? "",
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
    setReplyingTo(null);

    setComments((prevComments) => [newComment, ...prevComments]);

    await sdk.haptics.impactOccurred("medium");

    setTimeout(() => {
      scrollableContainerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 0);

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

      trackEvent("commented", {
        user: context?.user.username,
        parentCastHash: castHash,
      });

      mutate();
    } catch (error) {
      console.error("Error posting comment:", error);
      setComments((prevComments) =>
        prevComments.filter((c) => c.hash !== tempId)
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSize(1);
    }
  }, [isOpen, setSize]);

  return (
    <div onDoubleClick={(e) => e.stopPropagation()} className="z-[60]">
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
            {isLoading && comments.length === 0 ? (
              <div className="space-y-5">
                {[...Array(4)].map((_, index) => (
                  <CommentSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : !comments || comments.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No comments yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {comments.map((comment) => (
                  <CommentItem comment={comment} key={comment.hash} />
                ))}

                {(isLoading || isValidating) && nextCursor && (
                  <div className="flex justify-center items-center pt-6">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 flex items-center space-x-2">
            <Avatar
              user={{
                fid: user?.fid ?? 0,
                pfpUrl: user?.pfp_url ?? "",
                displayName: user?.display_name ?? "",
                username: user?.username ?? "",
              }}
              isComment
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
                  const isClickingSendButton =
                    (e.relatedTarget as HTMLElement)?.id ===
                    "send-comment-button";
                  if (commentText.length === 0 && !isClickingSendButton) {
                    setReplyingTo(null);
                  }
                }}
              />
              {commentText.length > 0 && (
                <Button
                  id="send-comment-button"
                  variant="action"
                  onClick={() => postComment(castHash, commentText)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm w-7 h-7 font-bold p-0"
                >
                  <ArrowUpIcon weight="bold" className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

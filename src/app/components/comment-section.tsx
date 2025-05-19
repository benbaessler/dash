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
import { CommentItem } from "./comment-item";
import { Input } from "@/components/ui/input";
import { Avatar } from "./avatar";
import { useFrame } from "@/providers/FrameProvider";
import { usePost } from "@/hooks/usePost";
import { appUrl } from "@/constants";
import { CommentSkeleton } from "./skeleton-loader";
import useSWRInfinite from "swr/infinite";
import { Loader } from "lucide-react";
import { usePlausible } from "next-plausible";

interface CommentSectionProps {
  children: React.ReactNode;
  castHash: string;
}

// Define API response type
interface CommentsResponse {
  comments: CommentData[];
  cursor?: string;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<CommentsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
};

// Custom hook for debouncing functions
function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
}

// Custom hook for infinite scroll
function useInfiniteScroll(
  scrollRef: React.RefObject<HTMLElement>,
  callback: () => void,
  options: {
    threshold?: number;
    loading?: boolean;
    hasMore?: boolean;
  } = {}
) {
  const { threshold = 0.8, loading = false, hasMore = false } = options;

  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= threshold) {
      callback();
    }
  }, [scrollRef, callback, threshold, loading, hasMore]);

  const debouncedCheck = useDebounce(checkScrollPosition, 200);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", debouncedCheck);

    return () => {
      container.removeEventListener("scroll", debouncedCheck);
    };
  }, [scrollRef, debouncedCheck]);
}

export const CommentSection = ({ children, castHash }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, sessionToken } = useFrame();
  const { checkAuth } = usePost();
  const plausible = usePlausible();

  const getKey = (
    pageIndex: number,
    previousPageData: CommentsResponse | null
  ) => {
    const url = new URL(`/api/comments`, appUrl);
    url.searchParams.append("hash", castHash);

    if (pageIndex === 0) {
      return url.toString();
    }

    // Stop fetching when we reach the end (no cursor returned)
    if (previousPageData && !previousPageData.cursor) {
      return null;
    }

    // Subsequent page requests with cursor
    url.searchParams.append("cursor", previousPageData?.cursor || "");
    return url.toString();
  };

  const {
    data: pagesData,
    setSize,
    isLoading: loading,
    isValidating,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    persistSize: true,
    revalidateAll: false,
  });

  const nextCursor = pagesData?.[pagesData.length - 1]?.cursor;

  // const handleCommentSelect = (comment: CommentData) => {
  //   setReplyingTo(comment);
  //   const commentId = `comment-${comment.hash}`;
  //   const commentElement = document.getElementById(commentId);

  //   if (commentElement && scrollableContainerRef.current) {
  //     commentElement.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //       inline: "nearest",
  //     });
  //   }

  //   inputRef.current?.focus();
  // };

  useEffect(() => {
    const allComments = pagesData
      ? pagesData.flatMap((page) => page.comments)
      : [];

    if (allComments.length > 0) {
      const tempComments = comments.filter((c) => c.hash.startsWith("temp-"));

      const existingComments = comments
        .filter((c) => !c.hash.startsWith("temp-"))
        .reduce((acc, comment) => {
          acc.set(comment.hash, comment);
          return acc;
        }, new Map<string, CommentData>());

      allComments.forEach((comment: CommentData) => {
        if (!comment.hash.startsWith("temp-")) {
          existingComments.set(comment.hash, comment);
        }
      });

      setComments([...tempComments, ...Array.from(existingComments.values())]);
    }
  }, [pagesData]);

  const loadMoreComments = useCallback(() => {
    const canLoadMore = nextCursor && !loading && !isValidating;
    if (canLoadMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [nextCursor, loading, isValidating, setSize]);

  const postComment = async (parentHash: string, textToPost: string) => {
    if (!user || !user.fid) return;

    const authorized = await checkAuth();
    if (!authorized) return;

    const tempId = `temp-${Date.now()}`;
    const newComment: CommentData = {
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
    setReplyingTo(null);

    setComments((prevComments) => [newComment, ...prevComments]);

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

      plausible("Commented", {
        props: {
          senderFid: user?.fid.toString(),
          castHash,
        },
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      setComments((prevComments) =>
        prevComments.filter((c) => c.hash !== tempId)
      );
      // Handle error cleanup for replies
      // else {
      //   setComments(prevComments =>
      //     prevComments.map(comment => {
      //       // Only update the parent comment
      //       if (comment.hash === parentHash) {
      //         return {
      //           ...comment,
      //           // Decrement reply count
      //           replies: {
      //             ...comment.replies,
      //             count: Math.max(0, comment.replies.count - 1)
      //           },
      //           // Remove the temporary reply from direct_replies
      //           direct_replies: comment.direct_replies?.filter(
      //             reply => reply.hash !== tempId
      //           ) || []
      //         };
      //       }
      //       return comment;
      //     })
      //   );
      // }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSize(1);
    }
  }, [isOpen, setSize]);

  // Use the custom infinite scroll hook
  useInfiniteScroll(scrollableContainerRef, loadMoreComments, {
    threshold: 0.8,
    loading: loading || isValidating,
    hasMore: !!nextCursor,
  });

  const renderSkeletons = (count = 4) => (
    <div className="space-y-5">
      {[...Array(count)].map((_, index) => (
        <CommentSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );

  const renderCommentList = () => {
    if (loading && comments.length === 0) {
      return renderSkeletons();
    }

    if (!comments || comments.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-500">No comments yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {comments.map((comment) => (
          <CommentItem
            comment={comment}
            key={comment.hash}
            // handleSelectComment={() => handleCommentSelect(comment)}
          />
        ))}

        {(loading || isValidating) && nextCursor && (
          <div className="flex justify-center items-center pt-6">
            <Loader className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>
    );
  };

  const renderCommentInput = () => (
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
            const isClickingSendButton =
              (e.relatedTarget as HTMLElement)?.id === "send-comment-button";
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
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

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
            {renderCommentList()}
          </div>

          {renderCommentInput()}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

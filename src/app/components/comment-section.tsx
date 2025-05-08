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

export const CommentSection = ({ children, castHash }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, sessionToken } = useFrame();
  const { checkAuth } = usePost();
  
  // Key generator function for SWR pagination
  const getKey = (pageIndex: number, previousPageData: CommentsResponse | null) => {
    // Create base URL for all requests
    const url = new URL(`/api/comments`, appUrl);
    url.searchParams.append("hash", castHash);
    
    // First page request
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
    mutate
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 seconds
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    persistSize: true,
    revalidateAll: false,
  });

  // Extract comments and next cursor from SWR data, ensuring no duplicates
  const allComments = pagesData 
    ? Array.from(
        new Map(
          pagesData.flatMap(page => page.comments || [])
            .map(comment => [comment.hash, comment])
        ).values()
      ) 
    : [];
  const nextCursor = pagesData?.[pagesData.length - 1]?.cursor;
  
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
    }

    inputRef.current?.focus();
  };

  // Update comments state when SWR data changes
  useEffect(() => {
    if (allComments.length > 0) {
      // Only update if there are actual changes (different comments)
      const hashesChanged = JSON.stringify(allComments.map(c => c.hash)) !== 
                           JSON.stringify(comments.map(c => c.hash));
      
      if (hashesChanged) {
        setComments(allComments);
      }
    }
  }, [allComments, comments]);

  // Load more comments function
  const loadMoreComments = useCallback(() => {
    const canLoadMore = nextCursor && !loading && !isValidating;
    if (canLoadMore) {
      setSize(prevSize => prevSize + 1);
    }
  }, [nextCursor, loading, isValidating, setSize]);

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
    setReplyingTo(null);

    // Handle top-level comments
    if (parentHash === castHash) {
      // Add the optimistic comment to the state, avoiding duplicates
      setComments(prevComments => {
        // Don't add if comment already exists
        if (prevComments.some(c => c.hash === optimisticComment.hash)) {
          return prevComments;
        }
        return [optimisticComment, ...prevComments];
      });
      
      // Scroll to top to show the new comment
      scrollableContainerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } 
    // Handle replies to existing comments
    else {
      const parentCast = comments.find(c => c.hash === parentHash);
      if (!parentCast) return;
      
      // Initialize direct_replies array if it doesn't exist
      if (!parentCast.direct_replies) {
        parentCast.direct_replies = [];
      }
      
      // Check if reply already exists
      const replyExists = parentCast.direct_replies.some(
        reply => reply.hash === optimisticComment.hash
      );
      
      // Only add reply if it doesn't already exist
      if (!replyExists) {
        // Increment reply count
        parentCast.replies.count++;
        
        // Add the new reply to the beginning of the replies array
        parentCast.direct_replies = [
          optimisticComment,
          ...parentCast.direct_replies
        ];
        
        // Expand the comment to show replies
        parentCast.isExpanded = true;
        
        // Update the comments state with the modified parent
        setComments(prevComments =>
          prevComments.map(comment =>
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

      // Revalidate the cache after posting a comment
      mutate();
    } catch (error) {
      console.error("Error posting comment:", error);
      // Handle error cleanup for top-level comments
      if (parentHash === castHash) {
        // Remove the optimistic comment from the list
        setComments(prevComments => 
          prevComments.filter(c => c.hash !== tempId)
        );
      } 
      // Handle error cleanup for replies
      else {
        setComments(prevComments =>
          prevComments.map(comment => {
            // Only update the parent comment
            if (comment.hash === parentHash) {
              return {
                ...comment,
                // Decrement reply count
                replies: {
                  ...comment.replies,
                  count: Math.max(0, comment.replies.count - 1)
                },
                // Remove the temporary reply from direct_replies
                direct_replies: comment.direct_replies?.filter(
                  reply => reply.hash !== tempId
                ) || []
              };
            }
            return comment;
          })
        );
      }
    }
  };

  // Reset pagination and fetch initial comments when drawer is opened
  useEffect(() => {
    if (isOpen) {
      // Use function form to avoid dependency on size
      setSize(1);
    }
  }, [isOpen, setSize]);

  // Infinite scroll handler using Intersection Observer
  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (!container) return;

    // Create and observe a sentinel element for infinite scrolling
    const sentinel = document.createElement("div");
    sentinel.id = "comments-sentinel";
    sentinel.style.height = "20px";
    sentinel.style.width = "100%";
    
    // Configure intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting;
        const canLoadMore = nextCursor && !loading && !isValidating;
        
        if (isIntersecting && canLoadMore) {
          loadMoreComments();
        }
      },
      { root: container, threshold: 0.1, rootMargin: "150px" }
    );
    
    // Add sentinel to container and observe it
    container.appendChild(sentinel);
    observer.observe(sentinel);
    
    // Cleanup function
    return () => {
      observer.disconnect();
      container.removeChild(sentinel);
    };
  }, [nextCursor, loading, isValidating, loadMoreComments]);

  // Render comment skeletons for loading state
  const renderSkeletons = (count = 4) => (
    <div className="space-y-5">
      {[...Array(count)].map((_, index) => (
        <CommentSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );

  // Render the main comment list
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
      <div className="space-y-5 pb-4">
        {/* Render all comments */}
        {comments.map(comment => (
          <CommentItem
            comment={comment}
            key={comment.hash}
            handleSelectComment={() => handleCommentSelect(comment)}
          />
        ))}
        
        {/* Loading state for pagination */}
        {(loading || isValidating) && nextCursor && (
          <div className="space-y-5" id="comments-loading">
            {renderSkeletons()}
          </div>
        )}
      </div>
    );
  };
  
  // Render comment input with avatar
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
            const isClickingSendButton = (e.relatedTarget as HTMLElement)?.id === "send-comment-button";
            if (commentText.length === 0 && !isClickingSendButton) {
              setReplyingTo(null);
            }
          }}
        />
        {commentText.length > 0 && (
          <Button
            id="send-comment-button"
            variant="action"
            onClick={() => postComment(
              replyingTo ? replyingTo.hash : castHash,
              commentText
            )}
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
          
          {/* Scrollable comment area */}
          <div
            ref={scrollableContainerRef}
            className="p-4 overflow-y-auto flex-grow w-full"
          >
            {renderCommentList()}
          </div>
          
          {/* Comment input area */}
          {renderCommentInput()}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

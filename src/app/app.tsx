"use client";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./components/video-player";
import { ApproveSignerDialog } from "./components/approve-signer-dialog";
import { useSigner } from "@/providers/SignerProvider";
import { useFrame } from "@/providers/FrameProvider";
import { InteractionButtons } from "./components/interaction-buttons";
import { Loading } from "./components/loading";
import { AddFramePage } from "./components/add-frame";

export default function App() {
  const { isSDKLoaded, context, sessionToken, signIn } = useFrame();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showSignerDialog, setShowSignerDialog] = useState(false);
  const { valid, signer, createSigner, loading: authLoading } = useSigner();
  const [feed, setFeed] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [recastedPosts, setRecastedPosts] = useState<Set<string>>(new Set());
  const [expandedTexts, setExpandedTexts] = useState<Set<string>>(new Set());

  const handleApproveSigner = async () => {
    setLoading(true);
    if (!signer) {
      await createSigner();
    }
    setShowSignerDialog(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);

    if (newIndex !== activeVideoIndex) {
      setActiveVideoIndex(newIndex);

      // Don't process further if we're on the share frame
      // This prevents video loading/autoplay issues when on the share frame
      if (newIndex === promotionPageIndex) return;

      // Get the real post index (accounting for share frame)
      const realPostIndex = getPostIndex(newIndex);
      
      // Fetch more content when user has scrolled through 5 videos or near the end of the feed
      if (!fetching && (realPostIndex % 5 === 0 || realPostIndex >= (feed?.length || 0) - 3)) {
        fetchFeed(10);
      }
    }
  };

  const fetchFeed = async (limit: number = 15) => {
    const fid = context?.user.fid;
    // for testing
    // const fid = 367782;

    setFetching(true);
    const response = await fetch(`/api/feed/${fid}?limit=${limit}`);
    const { data } = await response.json();
    setFeed((prevFeed) => [...(prevFeed || []), ...data]);
    setFetching(false);
  };

  const handleInteraction = async (
    e: React.MouseEvent,
    type: "like" | "recast",
    postId: string
  ) => {
    e.stopPropagation();

    if (!sessionToken) {
      try {
        await signIn();
      } catch (error) {
        console.error("Failed to sign in", error);
        return;
      }
    }

    if (authLoading) return;
    if (!valid) return await handleApproveSigner();

    const isLiked = likedPosts.has(postId);
    const isRecasted = recastedPosts.has(postId);
    const isRemoving =
      (type === "like" && isLiked) || (type === "recast" && isRecasted);

    // Optimistic update
    if (type === "like") {
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (isLiked) newSet.delete(postId);
        else newSet.add(postId);
        return newSet;
      });
    } else {
      setRecastedPosts((prev) => {
        const newSet = new Set(prev);
        if (isRecasted) newSet.delete(postId);
        else newSet.add(postId);
        return newSet;
      });
    }

    try {
      const endpoint = isRemoving
        ? "/api/reactions/delete"
        : "/api/reactions/publish";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          castHash: postId,
          type,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }
    } catch (error) {
      // Revert optimistic update on error
      if (type === "like") {
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (isLiked) newSet.add(postId);
          else newSet.delete(postId);
          return newSet;
        });
      } else {
        setRecastedPosts((prev) => {
          const newSet = new Set(prev);
          if (isRecasted) newSet.add(postId);
          else newSet.delete(postId);
          return newSet;
        });
      }
      console.error("Failed to update reaction:", error);
    }
  };

  useEffect(() => {
    if (isSDKLoaded && context?.user.fid) {
      fetchFeed();
    }
  }, [isSDKLoaded, context]);

  if (!feed) return <Loading />;

  // Share frame position in the feed (0-based index)
  const promotionPageIndex = Number(process.env.NEXT_PUBLIC_PROMOTION_PAGE_INDEX) || 10;
  
  // Prepare feed items with ShareFrame inserted
  const feedWithShareFrame: React.ReactNode[] = [];
  
  // Map to track the real index of posts with ShareFrame inserted
  const getPostIndex = (virtualIndex: number): number => {
    // If we're past the share frame
    return virtualIndex > promotionPageIndex ? virtualIndex - 1 : virtualIndex;
  };

  feed.forEach((post, index) => {
    // Insert ShareFrame at the configured position
    if (promotionPageIndex !== 0 && index === promotionPageIndex && !context?.client.added) {
      feedWithShareFrame.push(
        <div key="share-frame" className="h-screen w-screen snap-start">
          <AddFramePage />
        </div>
      );
    }
    
    // Create a video item
    feedWithShareFrame.push(
      <div
        key={`post-${index}`}
        className="h-screen w-screen snap-start relative"
        onDoubleClick={(e) => {
          if (!likedPosts.has(post.id)) {
            handleInteraction(e, "like", post.id);
          }
        }}
      >
        <VideoPlayer
          post={post}
          // Adjust isActive check to account for inserted ShareFrame
          isActive={getPostIndex(activeVideoIndex) === index}
          loading={loading}
          shouldPreload={
            // Preload current video and next 2 videos
            index === getPostIndex(activeVideoIndex) || 
            index === getPostIndex(activeVideoIndex) + 1 || 
            index === getPostIndex(activeVideoIndex) + 2
          }
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <InteractionButtons
            post={post}
            liked={likedPosts.has(post.id)}
            recasted={recastedPosts.has(post.id)}
            handleInteraction={(e, type) =>
              handleInteraction(e, type, post.id)
            }
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 mr-16 w-full overflow-hidden">
          <div className="flex flex-col w-full">
            <div className="text-white font-semibold truncate">
              {post.author.displayName}
            </div>
            <div className="text-white/90 text-sm mt-1 flex items-end gap-1 w-full">
              <div
                className={`flex-1 break-words overflow-hidden ${
                  !expandedTexts.has(post.id) ? "line-clamp-2" : ""
                } cursor-pointer`}
                onDoubleClick={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedTexts((prev) => {
                    const newSet = new Set(prev);
                    if (expandedTexts.has(post.id)) {
                      newSet.delete(post.id);
                    } else {
                      newSet.add(post.id);
                    }
                    return newSet;
                  });
                }}
              >
                {post.text}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <main
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory relative"
      onScroll={handleScroll}
    >
      {feedWithShareFrame}
      <ApproveSignerDialog
        open={showSignerDialog}
        onOpenChange={setShowSignerDialog}
        setLoading={setLoading}
      />
    </main>
  );
}

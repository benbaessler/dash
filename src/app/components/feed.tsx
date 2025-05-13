"use client";

import { ApproveSignerDialog } from "./approve-signer-dialog";
import { Loading } from "./loading";
import { AddFramePage } from "./add-frame";
import { Post } from "./post";
import { useSigner } from "@/providers/SignerProvider";
import { useFrame } from "@/providers/FrameProvider";
import { useFeed, usePost, useVideoNavigation } from "@/hooks";
import { Loader } from "lucide-react";
import { createPortal } from "react-dom";

interface FeedProps {
  initialPost?: Post;
}

export function Feed({ initialPost }: FeedProps) {
  const { loading } = useFrame();
  const { showDialog, setShowDialog } = useSigner();

  const {
    feed,
    setFeed,
    fetching,
    fetchFeed,
    getPostIndex,
    promotionPageIndex,
  } = useFeed();

  // If initialPost is provided, combine it with feed
  const combinedFeed = initialPost
    ? [
        initialPost,
        ...(feed?.filter((post) => post.id !== initialPost.id) || []),
      ]
    : feed;

  const {
    likedPosts,
    recastedPosts,
    expandedTexts,
    handleInteraction,
    toggleExpandText,
  } = usePost({
    feed: combinedFeed,
    setFeed,
  });

  const { activeVideoIndex, handleScroll, shouldPreloadVideo } =
    useVideoNavigation({
      feedLength: combinedFeed?.length || 0,
      promotionPageIndex:
        initialPost && promotionPageIndex > 0
          ? promotionPageIndex + 1
          : promotionPageIndex,
      getPostIndex,
      fetchMoreContent: fetchFeed,
      fetching,
    });

  if (!combinedFeed) return <Loading />;

  // Render post component for each post
  const renderPostItem = (post: Post, index: number, isActive: boolean) => (
    <Post
      key={`post-${index}`}
      data={post}
      index={index}
      isActive={isActive}
      loading={loading}
      shouldPreload={shouldPreloadVideo(index)}
      liked={post.viewerContext?.liked ?? likedPosts.has(post.id)}
      recasted={post.viewerContext?.recasted ?? recastedPosts.has(post.id)}
      expandedTexts={expandedTexts}
      toggleExpandText={toggleExpandText}
      handleInteraction={(e, type, id) =>
        handleInteraction(e, type as "like" | "recast", id)
      }
    />
  );

  const renderPromotionPost = () => (
    <div
      key="promotion-post"
      className="h-screen w-screen snap-start snap-always"
    >
      <AddFramePage />
    </div>
  );

  const feedWithShareFrame =
    combinedFeed && combinedFeed.length > 0
      ? combinedFeed.reduce<React.ReactNode[]>((acc, post, index) => {
          // Adjust promotion index if we have an initial post
          const adjustedPromotionIndex =
            initialPost && promotionPageIndex > 0
              ? promotionPageIndex + 1
              : promotionPageIndex;

          if (
            adjustedPromotionIndex !== 0 &&
            index === adjustedPromotionIndex
          ) {
            acc.push(renderPromotionPost());
          }

          acc.push(
            renderPostItem(
              post,
              index,
              getPostIndex(activeVideoIndex) === index
            )
          );

          return acc;
        }, [])
      : [];

  return (
    <main
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory relative"
      onScroll={handleScroll}
    >
      {feedWithShareFrame}
      <div className="z-[100]">
        <ApproveSignerDialog open={showDialog} onOpenChange={setShowDialog} />
      </div>
      {loading &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[50]">
            <Loader className="animate-spin" />
          </div>,
          document.body
        )}
    </main>
  );
}

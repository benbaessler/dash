"use client";

import { Loading } from "./loading";
import { Promotion } from "./promotion";
import { Post } from "./post";
import { useFrame } from "@/providers/FrameProvider";
import { useFeed, usePost, useVideoNavigation } from "@/hooks";
import { PromotionFrame } from "@/hooks/useFeed";

interface FeedProps {
  initialPost?: Post;
}

export function Feed({ initialPost }: FeedProps) {
  const { loading } = useFrame();

  const { feed, setFeed, fetching, fetchFeed, getPostIndex, promotionFrames } =
    useFeed();

  // If initialPost is provided, combine it with feed
  const combinedFeed = initialPost
    ? [
        initialPost,
        ...(feed?.filter((post) => post.id !== initialPost.id) || []),
      ]
    : feed;

  const adjustedPromotionFrames = initialPost
    ? promotionFrames.map((frame: PromotionFrame) => ({
        ...frame,
        index: frame.index > 0 ? frame.index + 1 : frame.index,
      }))
    : promotionFrames;

  const promotionPageIndexes = adjustedPromotionFrames.map(
    (frame: PromotionFrame) => frame.index
  );

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
      promotionPageIndexes,
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

  const renderPromotionPost = (
    type: "add-frame" | "share-app" | "join-channel"
  ) => (
    <div
      key={`promotion-${type}`}
      className="h-screen w-screen snap-start"
    >
      <Promotion type={type} />
    </div>
  );

  const feedWithPromotionFrames =
    combinedFeed && combinedFeed.length > 0
      ? combinedFeed.reduce<React.ReactNode[]>((acc, post, index) => {
          const promotionFrame = adjustedPromotionFrames.find(
            (frame: PromotionFrame) => frame.index === index
          );

          if (promotionFrame) {
            acc.push(renderPromotionPost(promotionFrame.promotionType));
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
      className="overflow-y-scroll snap-y snap-mandatory relative flex-1"
      onScroll={handleScroll}
    >
      {feedWithPromotionFrames}
    </main>
  );
}

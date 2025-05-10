"use client";
import { ApproveSignerDialog } from "./components/approve-signer-dialog";
import { useSigner } from "@/providers/SignerProvider";
import { Loading } from "./components/loading";
import { AddFramePage } from "./components/add-frame";
import { useFeed, usePost, useVideoNavigation } from "@/hooks";
import { useFrame } from "@/providers/FrameProvider";
import { Loader } from "lucide-react";
import { createPortal } from "react-dom";
import { Post } from "./components/post";

export default function App() {
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

  const {
    likedPosts,
    recastedPosts,
    expandedTexts,
    handleInteraction,
    toggleExpandText,
  } = usePost({
    feed,
    setFeed,
  });

  const { activeVideoIndex, handleScroll, shouldPreloadVideo } =
    useVideoNavigation({
      feedLength: feed?.length || 0,
      promotionPageIndex,
      getPostIndex,
      fetchMoreContent: fetchFeed,
      fetching,
    });

  if (!feed) return <Loading />;

  // Render post component for each post
  const renderPostItem = (post: Post, index: number, isActive: boolean) => (
    <Post
      key={`post-${index}`}
      data={post}
      index={index}
      isActive={isActive}
      loading={loading}
      shouldPreload={shouldPreloadVideo(index)}
      liked={likedPosts.has(post.id)}
      recasted={recastedPosts.has(post.id)}
      expandedTexts={expandedTexts}
      toggleExpandText={toggleExpandText}
      handleInteraction={(e, type, id) => handleInteraction(e, type as "like" | "recast", id)}
    />
  );

  const renderPromotionPost = () => (
    <div key="promotion-post" className="h-screen w-screen snap-start snap-always">
      <AddFramePage />
    </div>
  );

  // Prepare feed with share frame items using the custom hook's prepareFeedWithShareFrame function
  const feedWithShareFrame =
    feed && feed.length > 0
      ? feed.reduce<React.ReactNode[]>((acc, post, index) => {
          if (promotionPageIndex !== 0 && index === promotionPageIndex) {
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

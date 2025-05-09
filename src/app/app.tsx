"use client";
import { VideoPlayer } from "./components/video-player";
import { ApproveSignerDialog } from "./components/approve-signer-dialog";
import { useSigner } from "@/providers/SignerProvider";
import { InteractionButtons } from "./components/interaction-buttons";
import { Loading } from "./components/loading";
import { AddFramePage } from "./components/add-frame";
import { useFeed, usePost, useVideoNavigation } from "@/hooks";
import { Caption } from "./components/caption";
import { useFrame } from "@/providers/FrameProvider";
import { Loader } from "lucide-react";
import { createPortal } from "react-dom";

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
    <div
      key={`post-${index}`}
      className="h-screen w-screen snap-start snap-always relative"
      onDoubleClick={(e) => {
        if (!likedPosts.has(post.id)) {
          handleInteraction(e, "like", post.id);
        }
      }}
    >
      <VideoPlayer
        post={post}
        isActive={isActive}
        loading={loading}
        shouldPreload={shouldPreloadVideo(index)}
      />
      <div className="absolute right-4 bottom-6">
        <InteractionButtons
          post={post}
          liked={likedPosts.has(post.id)}
          recasted={recastedPosts.has(post.id)}
          handleInteraction={(e, type) => handleInteraction(e, type, post.id)}
        />
      </div>
      <Caption
        post={post}
        expandedTexts={expandedTexts}
        toggleExpandText={toggleExpandText}
      />
    </div>
  );

  // Render share frame component
  const renderShareFrame = () => (
    <div key="share-frame" className="h-screen w-screen snap-start snap-always">
      <AddFramePage />
    </div>
  );

  // Prepare feed with share frame items using the custom hook's prepareFeedWithShareFrame function
  const feedWithShareFrame =
    feed && feed.length > 0
      ? feed.reduce<React.ReactNode[]>((acc, post, index) => {
          // Insert ShareFrame at the configured position
          if (promotionPageIndex !== 0 && index === promotionPageIndex) {
            acc.push(renderShareFrame());
          }

          // Add the post item
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

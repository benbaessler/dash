"use client";
import { useState } from "react";
import { VideoPlayer } from "./components/video-player";
import { ApproveSignerDialog } from "./components/approve-signer-dialog";
import { useSigner } from "@/providers/SignerProvider";
import { InteractionButtons } from "./components/interaction-buttons";
import { Loading } from "./components/loading";
import { AddFramePage } from "./components/add-frame";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { useFeed, usePost, useVideoNavigation } from "@/hooks";

export default function App() {
  const [showSignerDialog, setShowSignerDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signer, createSigner } = useSigner();

  // Custom hook for handling feed
  const { feed, setFeed, fetching, fetchFeed, getPostIndex, promotionPageIndex } =
    useFeed();

  // Custom hook for handling post interactions
  const {
    likedPosts,
    recastedPosts,
    expandedTexts,
    handleInteraction,
    toggleExpandText,
  } = usePost({
    onApproveSignerRequest: async () => {
      setLoading(true);
      if (!signer) {
        await createSigner();
      }
      setShowSignerDialog(true);
    },
    feed,
    setFeed,
  });

  // Custom hook for video navigation
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
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <InteractionButtons
          post={post}
          liked={likedPosts.has(post.id)}
          recasted={recastedPosts.has(post.id)}
          handleInteraction={(e, type) => handleInteraction(e, type, post.id)}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-6 py-8 mr-16 w-full overflow-hidden">
        <div className="flex flex-col w-full">
          <div className="flex gap-2 items-center">
            <span className="text-slate-200 font-semibold truncate">
              {post.author.displayName}
            </span>
            <span className="text-slate-200/80 text-sm">
              {formatTimeAgo(post.timestamp)}
            </span>
          </div>
          <div className="text-slate-200/90 text-sm mt-1 flex items-end gap-1 w-full">
            <div
              className={`flex-1 break-words overflow-hidden ${
                !expandedTexts.has(post.id) ? "line-clamp-2" : ""
              } cursor-pointer`}
              onDoubleClick={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpandText(post.id);
              }}
            >
              {post.text}
            </div>
          </div>
        </div>
      </div>
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
      <ApproveSignerDialog
        open={showSignerDialog}
        onOpenChange={setShowSignerDialog}
        setLoading={setLoading}
      />
    </main>
  );
}

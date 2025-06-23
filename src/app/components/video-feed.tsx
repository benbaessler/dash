"use client";

import { Post } from "./post";
import { usePost, useVideoNavigation } from "@/hooks";
import { Loader } from "lucide-react";
import { createPortal } from "react-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useFrame } from "@/providers/FrameProvider";
import { ApproveSignerDialog } from "./approve-signer-dialog";
import { useSigner } from "@/providers/SignerProvider";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface VideoFeedProps {
  posts: Post[];
  initialIndex?: number;
  onClose?: () => void;
}

export function VideoFeed({
  posts,
  initialIndex = 0,
  onClose,
}: VideoFeedProps) {
  const { loading } = useFrame();
  const { showDialog, setShowDialog } = useSigner();

  const [feed, setFeed] = useState(posts);
  useEffect(() => {
    setFeed(posts);
  }, [posts]);

  const {
    likedPosts,
    recastedPosts,
    expandedTexts,
    handleInteraction,
    toggleExpandText,
  } = usePost({
    feed: feed,
    setFeed: setFeed as Dispatch<SetStateAction<Post[] | null>>,
  });

  const { activeVideoIndex, handleScroll, shouldPreloadVideo } =
    useVideoNavigation({
      initialIndex: initialIndex,
      feedLength: feed.length,
      getPostIndex: (i) => i,
    });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.clientHeight * initialIndex;
    }
  }, [initialIndex]);

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

  return (
    <div className="fixed inset-0 bg-black z-50">
      <button
        onClick={onClose}
        className="absolute top-10 left-4 z-[100] text-white"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <main
        ref={scrollContainerRef}
        className="overflow-y-scroll snap-y snap-mandatory relative h-full"
        onScroll={handleScroll}
      >
        {feed.map((post, index) =>
          renderPostItem(post, index, activeVideoIndex === index)
        )}
      </main>
      <div className="z-[100]">
        <ApproveSignerDialog open={showDialog} onOpenChange={setShowDialog} />
      </div>
      {loading &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[101]">
            <Loader className="animate-spin" />
          </div>,
          document.body
        )}
    </div>
  );
}

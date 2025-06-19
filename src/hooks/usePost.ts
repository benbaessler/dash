"use client";

import { useState } from "react";
import { useFrame } from "@/providers/FrameProvider";
import { useSigner } from "@/providers/SignerProvider";
import { sdk } from "@farcaster/frame-sdk";
import { useAnalytics } from "./useAnalytics";

interface UsePostOptions {
  feed?: Post[] | null;
  setFeed?: React.Dispatch<React.SetStateAction<Post[] | null>>;
}

interface UsePostResult {
  likedPosts: Set<string>;
  recastedPosts: Set<string>;
  expandedTexts: Set<string>;
  handleInteraction: (
    e: React.MouseEvent,
    type: "like" | "recast",
    postId: string
  ) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  toggleExpandText: (postId: string) => void;
  isTextExpanded: (postId: string) => boolean;
}

export function usePost({ feed, setFeed }: UsePostOptions = {}): UsePostResult {
  const { sessionToken, signIn, setLoading, context } = useFrame();
  const {
    valid,
    loading: authLoading,
    signer,
    createSigner,
    setShowDialog,
  } = useSigner();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [recastedPosts, setRecastedPosts] = useState<Set<string>>(new Set());
  const [expandedTexts, setExpandedTexts] = useState<Set<string>>(new Set());
  const { trackEvent } = useAnalytics();

  const checkAuth = async () => {
    if (!sessionToken) {
      try {
        await signIn();
      } catch (error) {
        console.error("Failed to sign in", error);
      }
      return false;
    }

    if (authLoading) return false;
    if (!valid) {
      if (!signer) {
        setLoading(true);
        await createSigner();
      }
      setShowDialog(true);
      return false;
    }
    return true;
  };

  // Handle interaction (like or recast)
  const handleInteraction = async (
    e: React.MouseEvent,
    type: "like" | "recast",
    postId: string
  ) => {
    e.stopPropagation();

    const authorized = await checkAuth();
    if (!authorized) return;

    const isLiked = likedPosts.has(postId);
    const isRecasted = recastedPosts.has(postId);
    const isRemoving =
      (type === "like" && isLiked) || (type === "recast" && isRecasted);

    // Optimistic update for state
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

    // Update feed directly in the App component by finding the post and updating it
    if (feed && feed.length > 0) {
      // Update the post in the feed array
      const feedPost = feed.find((post) => post.id === postId);
      if (feedPost) {
        if (type === "like") {
          feedPost.likeCount = isLiked
            ? feedPost.likeCount - 1
            : feedPost.likeCount + 1;
          // Update viewerContext to reflect the change
          if (feedPost.viewerContext) {
            feedPost.viewerContext.liked = !isLiked;
          }
        } else {
          feedPost.recastCount = isRecasted
            ? feedPost.recastCount - 1
            : feedPost.recastCount + 1;
          // Update viewerContext to reflect the change
          if (feedPost.viewerContext) {
            feedPost.viewerContext.recasted = !isRecasted;
          }
        }
        // Force re-render by creating a new array
        const updatedFeed = [...feed];
        if (setFeed) {
          setFeed(updatedFeed);
        }
      }
    }

    if (!isRemoving) await sdk.haptics.impactOccurred("medium");

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

      trackEvent(type === "like" ? "liked" : "recasted", {
        user: context?.user.username,
        castHash: postId,
      });
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

      // Revert feed updates on error
      if (feed && feed.length > 0) {
        const feedPost = feed.find((post) => post.id === postId);
        if (feedPost) {
          if (type === "like") {
            feedPost.likeCount = isLiked
              ? feedPost.likeCount + 1
              : feedPost.likeCount - 1;
            // Revert viewerContext changes
            if (feedPost.viewerContext) {
              feedPost.viewerContext.liked = isLiked;
            }
          } else {
            feedPost.recastCount = isRecasted
              ? feedPost.recastCount + 1
              : feedPost.recastCount - 1;
            // Revert viewerContext changes
            if (feedPost.viewerContext) {
              feedPost.viewerContext.recasted = isRecasted;
            }
          }
          // Force re-render by creating a new array
          const updatedFeed = [...feed];
          if (setFeed) {
            setFeed(updatedFeed);
          }
        }
      }

      console.error("Failed to update reaction:", error);
    }
  };

  // Toggle text expansion for a post
  const toggleExpandText = (postId: string) => {
    setExpandedTexts((prev) => {
      const newSet = new Set(prev);
      if (expandedTexts.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Check if text is expanded for a post
  const isTextExpanded = (postId: string): boolean => {
    return expandedTexts.has(postId);
  };

  return {
    likedPosts,
    recastedPosts,
    expandedTexts,
    handleInteraction,
    checkAuth,
    toggleExpandText,
    isTextExpanded,
  };
}

"use client";

import { useParams } from "next/navigation";
import { useFrame } from "@/providers/FrameProvider";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";
import { FeedView } from "@/app/components/feed";
import { Loading } from "@/app/components/common/loading";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Not found");
  }
  const { data } = await response.json();
  return data;
};

export default function Video() {
  const { hash } = useParams();
  const { context } = useFrame();
  const { toast } = useToast();

  const {
    data: post,
    error,
    isLoading,
  } = useSWR<VideoData>(
    hash && context?.user.fid
      ? `/api/post/${hash}?fid=${context.user.fid}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (error) {
    toast({
      title: "Post not found",
      description: "The linked cast could not be found",
    });
    return <Loading text="Post not found" />;
  }

  if (post && !post.video_url) {
    toast({
      title: "Not a video",
      description: "The linked cast is not a video",
    });
    return <Loading text="Not a video" />;
  }

  if (isLoading) return <Loading text="Loading video" />;
  if (!post) return null;

  return <FeedView initialPost={post} />;
}

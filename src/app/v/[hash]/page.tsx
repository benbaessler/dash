"use client";

import { useParams } from "next/navigation";
import { useFrame } from "@/providers/FrameProvider";
import { useCallback, useEffect, useState } from "react";
import { FeedView } from "@/app/components/feed";
import { Loading } from "@/app/components/common/loading";
import { useToast } from "@/hooks/use-toast";

export default function Video() {
  const { hash } = useParams();
  const { context } = useFrame();
  const [post, setPost] = useState<VideoData>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  // TODO: optimize fetching
  const getPost = useCallback(async () => {
    const response = await fetch(`/api/post/${hash}?fid=${context?.user.fid}`);
    if (!response.ok) {
      setNotFound(true);
      setLoading(false);
      toast({
        title: "Post not found",
        description: "The linked cast could not be found",
      });
      return;
    }
    const { data } = await response.json();
    console.log(data);

    if (!data.video_url) {
      setNotFound(true);
      setLoading(false);
      toast({
        title: "Not a video",
        description: "The linked cast is not a video",
      });
      return;
    }

    setPost(data);
    setLoading(false);
  }, [hash, context?.user.fid]);

  useEffect(() => {
    if (hash && !post && context?.user.fid && !notFound) {
      getPost();
    }
  }, [hash, context, getPost]);

  if (loading) return <Loading text={loading && "Loading video"} />;

  return loading ? (
    <Loading />
  ) : (
    <div className="h-screen w-screen flex flex-col">
      <FeedView initialPost={post} />
    </div>
  );
}

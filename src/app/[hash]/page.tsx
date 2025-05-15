"use client";

import { useParams } from "next/navigation";
import { useFrame } from "@/providers/FrameProvider";
import { useCallback, useEffect, useState } from "react";
import { Feed } from "../components/feed";
import { Loading } from "../components/loading";
import { useToast } from "@/hooks/use-toast";

export default function Video() {
  const { hash } = useParams();
  const { context } = useFrame();
  const [post, setPost] = useState<Post>();
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
        description: "The linked cast may not contain a video",
      });
      return;
    }
    const { data } = await response.json();
    setPost(data);
    setLoading(false);
  }, [hash, context?.user.fid]);

  useEffect(() => {
    if (hash && !post && context?.user.fid && !notFound) {
      getPost();
    }
  }, [hash, context, getPost]);

  if (loading) return <Loading text={loading && "Loading video"} />;

  return loading ? <Loading /> : <Feed initialPost={post} />;
}

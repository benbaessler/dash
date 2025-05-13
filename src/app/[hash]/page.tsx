"use client";

import { useParams } from "next/navigation";
import { useFrame } from "@/providers/FrameProvider";
import { useCallback, useEffect, useState } from "react";
import { Feed } from "../components/feed";
import { Loading } from "../components/loading";

export default function Video() {
  const { hash } = useParams();
  const { context } = useFrame();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // TODO: optimize fetching
  const getPost = useCallback(async () => {
    const res = await fetch(`/api/post/${hash}?fid=${context?.user.fid}`);
    const { data } = await res.json();
    setPost(data);
    setLoading(false);
  }, [hash, context?.user.fid]);

  useEffect(() => {
    if (hash && !post && context?.user.fid) {
      getPost();
    }
  }, [hash, context, getPost]);

  if (loading) return <Loading />;

  return post ? <Feed initialPost={post} /> : <Loading />;
}

"use client";

import { useFrame } from "@/providers/FrameProvider";
import { isDevelopment } from "@/constants";
import useSWRInfinite from "swr/infinite";

export const useFeed = (initialLimit = 15) => {
  const { isSDKLoaded, context } = useFrame();
  const fid = isDevelopment ? 367782 : context?.user.fid;

  const getKey = (_: number, previousPageData: VideoData[]) => {
    if (
      !fid ||
      !isSDKLoaded ||
      // If previous page has no data, we've reached the end
      (previousPageData && previousPageData.length === 0)
    )
      return null;
    return `/api/feed/${fid}?limit=${initialLimit}`;
  };

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  };

  const { data, isValidating, setSize, size } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 0,
      persistSize: false,
    }
  );

  const feed = data ? ([] as FeedItem[]).concat(...data) : null;

  const fetchMore = async () => {
    await setSize(size + 1);
  };

  return {
    feed,
    fetching: isValidating,
    fetchMore,
  };
};

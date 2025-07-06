import { useFrame } from "@/providers/FrameProvider";
import { FeedView } from "../feed";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@/utils/fetcher";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
  channelId: string;
  idle?: boolean;
}

export const ChannelFeed = ({ channelId, idle = false }: Props) => {
  const { sessionToken } = useFrame();
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const getKey = (
    pageIndex: number,
    previousPageData: { data: VideoData[]; cursor: string | null } | null
  ) => {
    if (pageIndex === 0) {
      return !idle && sessionToken ? `/api/videos/channel/${channelId}` : null;
    }
    if (
      previousPageData &&
      (!previousPageData.cursor || previousPageData.data.length === 0)
    ) {
      return null;
    }
    return !idle && sessionToken
      ? `/api/videos/channel/${channelId}?cursor=${
          previousPageData?.cursor || ""
        }`
      : null;
  };

  const {
    data: pagesData,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite(getKey, (url: string) => fetcher(url, sessionToken!), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    persistSize: true,
    revalidateAll: false,
  });

  const feedData: VideoData[] = useMemo(() => {
    if (!pagesData) return [];
    return pagesData.flatMap((page) => page.data);
  }, [pagesData]);

  const nextCursor = pagesData?.[pagesData.length - 1]?.cursor;

  const fetchMore = useCallback(() => {
    const canLoadMore =
      nextCursor && !isLoading && !isValidating && !hasReachedEnd;
    if (canLoadMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [nextCursor, isLoading, isValidating, hasReachedEnd, setSize]);

  useEffect(() => {
    if (pagesData && pagesData.length > 0) {
      const lastPage = pagesData[pagesData.length - 1];
      if (lastPage.data.length === 0 || !lastPage.cursor) {
        setHasReachedEnd(true);
      }
    }
  }, [pagesData]);

  return (
    <FeedView
      idle={idle}
      feed={feedData}
      fetching={isLoading || isValidating}
      fetchMore={fetchMore}
    />
  );
};

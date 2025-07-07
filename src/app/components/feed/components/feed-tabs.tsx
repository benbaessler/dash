import { PlusIcon } from "@phosphor-icons/react";
import React, { useMemo } from "react";
import { useFrame } from "@/providers/FrameProvider";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

interface Props {
  activeFeed: string;
  setActiveFeed: (feed: string) => void;
  onAddChannel?: () => void;
}

export const FeedTabs = ({
  activeFeed,
  setActiveFeed,
  onAddChannel,
}: Props) => {
  const { sessionToken } = useFrame();

  const { data, isLoading } = useSWR(
    sessionToken ? "/api/feed/saved" : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const tabs = useMemo(() => ["Explore", ...(data || [])], [data]);

  return (
    <div className="absolute top-3 left-5 flex gap-4 z-[5] items-center drop-shadow-sm bg-black/5 backdrop-blur-sm rounded-lg px-4 py-2">
      {isLoading ? (
        <span className="text-gray-200">Loading...</span>
      ) : (
        tabs.map((tab) => (
          <span
            key={tab}
            onClick={() => setActiveFeed(tab.toLowerCase())}
            className={`font-medium cursor-pointer hover:text-white transition-colors duration-150 ${
              activeFeed.toLowerCase() === tab.toLowerCase()
                ? "text-white"
                : "text-gray-200"
            }`}
          >
            {tab}
          </span>
        ))
      )}
      <PlusIcon
        size={20}
        weight="bold"
        className="text-gray-200 cursor-pointer hover:text-white transition-colors duration-150"
        onClick={onAddChannel}
      />
    </div>
  );
};

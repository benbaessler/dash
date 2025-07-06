import { useEffect, useState } from "react";
import { ChannelFeed } from "./components/channel-feed";
import { FeedView } from "./components/feed-view";
import { useFeed } from "@/hooks/useFeed";
import { PlusIcon } from "@phosphor-icons/react";

interface Props {
  initialFeed: string; // define type for feeds (explore, following, channelIds)
  initialVideo?: VideoData;
  idle?: boolean;
}

export const FeedPage = ({
  initialFeed,
  initialVideo,
  idle = false,
}: Props) => {
  const [activeFeed, setActiveFeed] = useState(initialFeed);
  const { feed, fetching, fetchMore } = useFeed({ initialVideo });

  const tabs = ["Explore", "/science"];

  useEffect(() => {
    setActiveFeed(initialFeed);
  }, [initialFeed]);

  return (
    <div className="relative h-full w-full">
      {activeFeed === "explore" && (
        <FeedView
          feed={feed}
          fetching={fetching}
          fetchMore={fetchMore}
          idle={activeFeed !== "explore" || idle}
        />
      )}
      {activeFeed.startsWith("/") && (
        <ChannelFeed
          channelId={activeFeed.slice(1)}
          idle={!activeFeed.startsWith("/") || idle}
        />
      )}
      <div className="absolute top-3 left-5 flex gap-4 z-[5] items-center drop-shadow-sm bg-black/5 backdrop-blur-sm rounded-lg px-4 py-2">
        {tabs.map((tab) => (
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
        ))}
        <PlusIcon
          size={20}
          weight="bold"
          className="text-gray-200 cursor-pointer hover:text-white transition-colors duration-150"
        />
      </div>
    </div>
  );
};

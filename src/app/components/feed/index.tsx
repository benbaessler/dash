import { useEffect, useState } from "react";
import { ChannelFeed } from "./components/channel-feed";
import { FeedView } from "./components/feed-view";
import { useFeed } from "@/hooks/useFeed";
import { FeedTabs } from "./components/feed-tabs";
import { useNavigation } from "@/providers/NavigationProvider";

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
  const { activeFeed, setActiveFeed, setSelectedTab } = useNavigation();
  const { feed, fetching, fetchMore } = useFeed({ initialVideo });
  const [feedIndices, setFeedIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    setActiveFeed(initialFeed);
  }, [initialFeed]);

  const handleIndexChange = (index: number) => {
    setFeedIndices((prev) => ({ ...prev, [activeFeed]: index }));
  };

  return (
    <div className="relative h-full w-full">
      {activeFeed === "explore" && (
        <FeedView
          feed={feed}
          fetching={fetching}
          fetchMore={fetchMore}
          idle={activeFeed !== "explore" || idle}
          initialIndex={feedIndices["explore"] || 0}
          onIndexChange={handleIndexChange}
        />
      )}
      {activeFeed.startsWith("/") && (
        <ChannelFeed
          channelId={activeFeed.slice(1)}
          idle={!activeFeed.startsWith("/") || idle}
          initialIndex={feedIndices[activeFeed] || 0}
          onIndexChange={handleIndexChange}
        />
      )}
      <FeedTabs
        activeFeed={activeFeed}
        setActiveFeed={setActiveFeed}
        onAddChannel={() => setSelectedTab("search")}
      />
    </div>
  );
};

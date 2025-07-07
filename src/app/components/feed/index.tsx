import { useEffect, useState } from "react";
import { ChannelFeed } from "./components/channel-feed";
import { FeedView } from "./components/feed-view";
import { useFeed } from "@/hooks/useFeed";
import { PlusIcon } from "@phosphor-icons/react";
import { FeedTabs } from "./components/feed-tabs";

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
      <FeedTabs
        activeFeed={activeFeed}
        setActiveFeed={setActiveFeed}
        onAddChannel={() => { /* TODO: handle add channel */ }}
      />
    </div>
  );
};

import { useEffect, useState } from "react";
import { ChannelFeed } from "./components/channel-feed";
import { FeedView } from "./components/feed-view";
import { useFeed } from "@/hooks/useFeed";

interface Props {
  initialFeed: string; // define type for feeds (explore, following, channelIds)
  initialVideo?: VideoData;
}

export const FeedPage = ({ initialFeed, initialVideo }: Props) => {
  const [activeFeed, setActiveFeed] = useState(initialFeed);
  const { feed, fetching, fetchMore } = useFeed({ initialVideo });

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
          idle={activeFeed !== "explore"}
        />
      )}
      {activeFeed.startsWith("/") && (
        <ChannelFeed
          channelId={activeFeed.slice(1)}
          idle={!activeFeed.startsWith("/")}
        />
      )}
      <div className="absolute top-0 left-0">
        <span>Explore</span>
      </div>
    </div>
  );
};

"use client";
import { Feed } from "./components/feed";
import { FeedSwitcher } from "./components/feed-switcher";
import { useState } from "react";

export default function App() {
  const [activeFeed, setActiveFeed] = useState<FeedType>("explore");
  const [loadedFeeds, setLoadedFeeds] = useState<Set<FeedType>>(
    new Set(["explore"])
  );

  const handleFeedChange = (feedType: FeedType) => {
    setActiveFeed(feedType);
    setLoadedFeeds((prev) => new Set(prev).add(feedType));
  };

  return (
    <div className="h-screen w-screen relative">
      <FeedSwitcher
        handleFeedChange={handleFeedChange}
        activeFeed={activeFeed}
      />

      {/* Explore Feed */}
      {loadedFeeds.has("explore") && (
        <div className={activeFeed === "explore" ? "block" : "hidden"}>
          <Feed feedType="explore" />
        </div>
      )}

      {/* Following Feed */}
      {loadedFeeds.has("following") && (
        <div className={activeFeed === "following" ? "block" : "hidden"}>
          <Feed feedType="following" />
        </div>
      )}
    </div>
  );
}

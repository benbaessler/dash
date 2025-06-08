"use client";
import { Feed } from "./components/feed";
import { FeedSwitcher } from "./components/feed-switcher";
import { useState } from "react";

export default function App() {
  const [activeFeed, setActiveFeed] = useState<FeedType>("explore");

  const handleFeedChange = (feedType: FeedType) => {
    setActiveFeed(feedType);
  };

  return (
    <div className="h-screen w-screen relative">
      <FeedSwitcher
        handleFeedChange={handleFeedChange}
        activeFeed={activeFeed}
      />
      <Feed key={activeFeed} feedType={activeFeed} />
    </div>
  );
}

interface FeedSwitcherProps {
  handleFeedChange: (feedType: FeedType) => void;
  activeFeed: FeedType;
}

export const FeedSwitcher = ({
  handleFeedChange,
  activeFeed,
}: FeedSwitcherProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center">
      <div className="flex items-center space-x-8 py-4">
        <button
          onClick={() => handleFeedChange("following")}
          className={`font-medium transition-colors duration-200 ${
            activeFeed === "following" ? "text-white" : "text-slate-400"
          }`}
        >
          Following
        </button>
        <button
          onClick={() => handleFeedChange("explore")}
          className={`font-medium transition-colors duration-200 ${
            activeFeed === "explore" ? "text-white" : "text-slate-400"
          }`}
        >
          Explore
        </button>
      </div>
    </div>
  );
};

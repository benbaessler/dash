interface FeedSwitcherProps {
  handleFeedChange: (feedType: FeedType) => void;
  activeFeed: FeedType;
}

export const FeedSwitcher = ({
  handleFeedChange,
  activeFeed,
}: FeedSwitcherProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center">
      <div className="flex items-center space-x-8 py-4">
        <div
          onClick={() => handleFeedChange("following")}
          className={`drop-shadow-sm font-medium cursor-pointer transition-colors duration-300 ease-in-out ${
            activeFeed === "following" ? "text-white" : "text-gray-400"
          }`}
        >
          Following
        </div>
        <div
          onClick={() => handleFeedChange("explore")}
          className={`drop-shadow-sm font-medium cursor-pointer transition-colors duration-300 ease-in-out ${
            activeFeed === "explore" ? "text-white" : "text-gray-400"
          }`}
        >
          Explore
        </div>
      </div>
    </div>
  );
};

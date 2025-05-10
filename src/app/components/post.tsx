"use client";
import { VideoPlayer } from "./video-player";
import { Caption } from "./caption";
import { InteractionButtons } from "./interaction-buttons";

interface PostProps {
  data: Post;
  index: number;
  isActive: boolean;
  loading: boolean;
  shouldPreload: boolean;
  liked: boolean;
  recasted: boolean;
  expandedTexts: Set<string>;
  toggleExpandText: (id: string) => void;
  handleInteraction: (e: React.MouseEvent, type: string, id: string) => void;
}

export const Post = ({
  data,
  isActive,
  loading,
  shouldPreload,
  liked,
  recasted,
  expandedTexts,
  toggleExpandText,
  handleInteraction,
}: PostProps) => (
  <div
    className="h-screen w-screen snap-start snap-always relative"
    onDoubleClick={(e) => {
      if (!liked) {
        handleInteraction(e, "like", data.id);
      }
    }}
  >
    <VideoPlayer
      post={data}
      isActive={isActive}
      loading={loading}
      shouldPreload={shouldPreload}
    />
    <Caption
      post={data}
      expandedTexts={expandedTexts}
      toggleExpandText={toggleExpandText}
    />
    <div className="absolute right-4 bottom-6">
      <InteractionButtons
        post={data}
        liked={liked}
        recasted={recasted}
        handleInteraction={(e, type) => handleInteraction(e, type, data.id)}
      />
    </div>
  </div>
);

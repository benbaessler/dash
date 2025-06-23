"use client";
import { VideoPlayer } from "./video-player";
import { Caption } from "./caption";
import { InteractionButtons } from "./interaction-buttons";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFrame } from "@/providers/FrameProvider";
import { TimeSlider } from "./time-slider";

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
}: PostProps) => {
  const { trackEvent } = useAnalytics();
  const { user } = useFrame();

  return (
    <div
      className="h-full w-screen snap-start snap-always relative"
      onDoubleClick={(e) => {
        if (!liked) {
          handleInteraction(e, "like", data.id);
          trackEvent("double_tap_like", {
            user: user?.username,
            castHash: data.id
          });
        }
      }}
    >
      <VideoPlayer
        post={data}
        isActive={isActive}
        loading={loading}
        shouldPreload={shouldPreload}
        renderTimeSlider={() => <TimeSlider />}
      />

      <Caption
        post={data}
        expandedTexts={expandedTexts}
        toggleExpandText={toggleExpandText}
      />
      <div className="absolute right-4 bottom-4">
        <InteractionButtons
          post={data}
          liked={data.viewerContext?.liked ?? liked}
          recasted={data.viewerContext?.recasted ?? recasted}
          handleInteraction={(e, type) => handleInteraction(e, type, data.id)}
        />
      </div>
    </div>
  );
};

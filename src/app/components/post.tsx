"use client";
import { VideoPlayer } from "./video-player";
import { Caption } from "./caption";
import { InteractionButtons } from "./interaction-buttons";
import { TimeSlider } from "@vidstack/react";

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
  return (
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
        renderTimeSlider={() => (
          <div
            className="absolute flex justify-center bottom-8 left-0 right-0 w-full z-10"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <TimeSlider.Root className="group mx-5 relative inline-flex h-6 w-full cursor-pointer touch-none select-none items-center outline-none aria-hidden:hidden">
              <TimeSlider.Track className="relative ring-sky-400 z-0 h-1 w-full bg-white/25 rounded-sm group-data-[focus]:ring-[3px]">
                <TimeSlider.TrackFill className="bg-white/60 absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
                {/* <TimeSlider.Progress className="absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/25 will-change-[width]" /> */}
              </TimeSlider.Track>
              {/* <TimeSlider.Thumb className="absolute left-[var(--slider-fill)] top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 group-data-[active]:opacity-100 will-change-[left]" /> */}
            </TimeSlider.Root>
          </div>
        )}
      />

      <Caption
        post={data}
        expandedTexts={expandedTexts}
        toggleExpandText={toggleExpandText}
      />
      <div className="absolute right-4 bottom-14">
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

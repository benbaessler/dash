import { TimeSlider } from "@vidstack/react";

export const PlaybackSlider = () => (
  <TimeSlider.Root className="group relative mx-5 inline-flex h-8 w-full cursor-pointer touch-none select-none items-center outline-none aria-hidden:hidden">
    <TimeSlider.Track className="relative ring-sky-400 z-0 h-[4px] w-full rounded-sm bg-white/20 group-data-[focus]:ring-[3px]">
      <TimeSlider.TrackFill className="bg-white absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
      <TimeSlider.Progress className="absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/30 will-change-[width]" />
    </TimeSlider.Track>
    <TimeSlider.Thumb className="absolute left-[var(--slider-fill)] top-1/2 z-20 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-data-[active]:opacity-100 will-change-[left]" />
  </TimeSlider.Root>
);

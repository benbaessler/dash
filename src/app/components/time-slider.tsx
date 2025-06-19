import { TimeSlider as VidstackTimeSlider } from "@vidstack/react";

export const TimeSlider = () => (
  <VidstackTimeSlider.Root className="group mx-5 relative inline-flex h-6 w-full cursor-pointer touch-none select-none items-center outline-none aria-hidden:hidden">
    <VidstackTimeSlider.Track className="relative ring-sky-400 z-0 h-1 w-full bg-white/25 rounded-sm group-data-[focus]:ring-[3px]">
      <VidstackTimeSlider.TrackFill className="bg-white/60 absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
      {/* <TimeSlider.Progress className="absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/25 will-change-[width]" /> */}
    </VidstackTimeSlider.Track>
    {/* <TimeSlider.Thumb className="absolute left-[var(--slider-fill)] top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 group-data-[active]:opacity-100 will-change-[left]" /> */}
  </VidstackTimeSlider.Root>
);

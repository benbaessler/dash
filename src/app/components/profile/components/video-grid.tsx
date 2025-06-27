import { Skeleton } from "@/app/components/common/skeleton";
import { GridItem } from "./grid-item";

interface VideoGridProps {
  data: VideoData[];
  isLoading: boolean;
  onItemClick?: (index: number) => void;
}

export function VideoGrid({ data, isLoading, onItemClick }: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-px pt-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="aspect-[9/13] w-full">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="mt-4 text-center py-10">
        <p className="text-slate-400">No videos yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-px pt-4">
      {data.map((item, index) => (
        <GridItem
          key={item.id}
          data={item}
          onClick={() => onItemClick?.(index)}
        />
      ))}
    </div>
  );
}

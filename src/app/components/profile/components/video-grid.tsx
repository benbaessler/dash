import { Skeleton } from "@/app/components/common/skeleton";
import { GridItem } from "./grid-item";

interface VideoGridProps {
  data: VideoData[];
  isLoading: boolean;
  onItemClick?: (index: number) => void;
}

export function VideoGrid({ data, isLoading, onItemClick }: VideoGridProps) {
  if (!isLoading && (!data || data.length === 0)) {
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

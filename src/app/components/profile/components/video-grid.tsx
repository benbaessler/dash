import { GridItem } from "./grid-item";

interface VideoGridProps {
  data: VideoData[];
  isLoading: boolean;
  hasReachedEnd: boolean;
  onItemClick?: (index: number) => void;
}

export function VideoGrid({
  data,
  isLoading,
  hasReachedEnd,
  onItemClick,
}: VideoGridProps) {
  if (!isLoading && hasReachedEnd && (!data || data.length === 0)) {
    return (
      <div className="mt-4 text-center py-10">
        <p className="text-slate-400">No recent videos</p>
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

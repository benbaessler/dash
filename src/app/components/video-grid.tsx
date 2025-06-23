import { Skeleton } from "@/app/components/skeleton";

interface VideoGridProps {
  posts: Post[];
  isLoading: boolean;
  onVideoClick?: (index: number) => void;
}

export function VideoGrid({ posts, isLoading, onVideoClick }: VideoGridProps) {
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

  if (!posts || posts.length === 0) {
    return (
      <div className="mt-4 text-center py-10">
        <p className="text-slate-400">No videos yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-px pt-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="relative aspect-[9/13] w-full bg-slate-800 group cursor-pointer"
          onClick={() => onVideoClick?.(index)}
        >
          <div className="w-full h-full bg-slate-700 transition-opacity group-hover:opacity-75"></div>
        </div>
      ))}
    </div>
  );
} 
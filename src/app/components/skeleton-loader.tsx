import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-700/50",
        className
      )}
      {...props}
    />
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 w-full">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="space-y-4 w-full">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
} 
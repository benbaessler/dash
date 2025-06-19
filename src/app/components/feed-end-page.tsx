import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export function FeedEndPage({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center bg-black h-screen w-screen snap-start">
      <CheckCircleIcon className="w-28 h-28 text-green-500" />
      <div className="text-center whitespace-nowrap text-2xl font-semibold">
        {"You're all caught up!"}
      </div>
      <Button size="lg" variant="action" className="mt-4" onClick={onClick}>
        Explore more videos
      </Button>
    </div>
  );
}

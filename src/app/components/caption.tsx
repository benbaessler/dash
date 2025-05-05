import { formatTimeAgo } from "@/utils/formatTimeAgo";

interface CaptionProps {
  post: {
    id: string;
    author: {
      displayName: string;
    };
    timestamp: number;
    text: string;
  };
  expandedTexts: Set<string>;
  toggleExpandText: (postId: string) => void;
}

export function Caption({ post, expandedTexts, toggleExpandText }: CaptionProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 mr-16 w-full overflow-hidden">
      <div className="flex flex-col">
        <div className="flex gap-2 items-center">
          <span className="text-slate-200 font-semibold truncate">
            {post.author.displayName}
          </span>
          <span className="text-slate-200/80 text-sm">
            {formatTimeAgo(post.timestamp)}
          </span>
        </div>
        <div className="text-slate-200/90 text-sm mt-1 flex items-end gap-1 w-full">
          <div
            className={`flex-1 break-words overflow-hidden ${
              !expandedTexts.has(post.id) ? "line-clamp-2" : ""
            } cursor-pointer`}
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandText(post.id);
            }}
          >
            {post.text}
          </div>
        </div>
      </div>
    </div>
  );
}

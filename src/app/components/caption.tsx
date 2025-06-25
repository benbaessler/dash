import { formatTimeAgo } from "@/utils/formatTime";
import { ClickableText } from "./text";
import { useState } from "react";

interface CaptionProps {
  data: VideoData;
}

export function Caption({ data }: CaptionProps) {
  const { author, text, timestamp } = data;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 px-5 w-full pr-16 overflow-hidden bg-gradient-to-t from-black/70 via-black/40 to-transparent pb-3">
      <div className="flex flex-col">
        <div className="flex gap-2 items-center">
          <span className="text-white font-semibold truncate">
            {author.displayName}
          </span>
          <span className="text-white/80 text-sm">
            {formatTimeAgo(timestamp)}
          </span>
        </div>
        <div className="text-white/90 mt-1 flex items-end gap-1 w-full">
          <div
            className="flex-1 flex flex-col w-full"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <div
              className={`break-words overflow-hidden overflow-x-hidden ${
                !expanded
                  ? "line-clamp-2"
                  : "max-h-[60vh] overflow-y-auto"
              } cursor-pointer`}
            >
              <ClickableText text={text} />
            </div>
            {text.length > 100 && (
              <div className="opacity-60 hover:opacity-80 text-sm font-medium mt-1 cursor-pointer">
                {expanded ? "Show less" : "Show more"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

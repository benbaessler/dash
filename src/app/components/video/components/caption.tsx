import { formatTimeAgo } from "@/utils/formatTime";
import { ClickableText } from "../../common/text";
import { useState } from "react";

interface CaptionProps {
  data: VideoData;
}

export function Caption({ data }: CaptionProps) {
  const { author, text, timestamp } = data;
  const [expanded, setExpanded] = useState(false);
  
  const shouldShowToggle = text.length > 100;

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 px-5 pr-16 pb-7 bg-gradient-to-t from-black/70 via-black/40 to-transparent drop-shadow-sm">
      <div className="flex gap-2 items-center">
        <span className="text-white font-semibold truncate">
          {author.username}
        </span>
        <span className="text-white/80 text-sm">
          {formatTimeAgo(timestamp)}
        </span>
      </div>
      
      <div className="text-white/90 mt-1" onClick={toggleExpanded}>
        <div
          className={`break-words cursor-pointer ${
            expanded ? "max-h-[60vh] overflow-y-auto" : "line-clamp-2"
          }`}
        >
          <ClickableText text={text} />
        </div>
        
        {shouldShowToggle && (
          <div className="text-sm font-medium mt-1 opacity-60 hover:opacity-80 cursor-pointer">
            {expanded ? "Show less" : "Show more"}
          </div>
        )}
      </div>
    </div>
  );
}

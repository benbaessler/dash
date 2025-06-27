import { PlayIcon, HeartIcon } from "@phosphor-icons/react";
import { formatDuration } from "@/utils/formatTime";

interface Props {
  data: VideoData;
  onClick: () => void;
}

export const GridItem = ({ data, onClick }: Props) => (
  <div
    className="relative aspect-[9/13] w-full bg-gradient-to-b from-[#231942] to-[#15162b] group cursor-pointer"
    onClick={onClick}
  >
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="text-center w-full">
        <span 
          className="text-white text-balance text-xs leading-snug drop-shadow-md block overflow-hidden break-words line-clamp-2"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            transform: 'translateZ(0)',
            willChange: 'auto'
          }}
        >
          {data.text.slice(0, 60)}
          {data.text.length > 60 && "..."}
        </span>
      </div>
    </div>
    <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between p-2">
      <div className="flex items-center gap-1">
        <PlayIcon size={13} weight="bold" className="text-white/80" />
        <span className="text-white text-xs font-medium">
          {formatDuration(data.duration ?? 0)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <HeartIcon
          size={13}
          weight={data.viewerContext?.liked ? "fill" : "bold"}
          className={
            data.viewerContext?.liked ? "text-red-400" : "text-white/80"
          }
        />
        <span className="text-white text-xs font-medium">{data.likeCount}</span>
      </div>
    </div>
  </div>
);

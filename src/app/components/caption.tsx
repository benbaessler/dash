import { formatTimeAgo } from "@/utils/formatTime";
import { sdk } from "@farcaster/frame-sdk";

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

interface ClickableTextProps {
  text: string;
}

function ClickableText({ text }: ClickableTextProps) {
  const parts = [];
  let lastIndex = 0;

  const pattern = /(?<=\s|^)((@\w+|\/\w+)|(https?:\/\/[^\s]+|www\.[^\s]+))/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (lastIndex < match.index) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchText = match[0];
    
    if (matchText.startsWith("@")) {
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="text-blue-400 hover:text-blue-500 cursor-pointer"
          onClick={() =>
            sdk.actions.openUrl(
              `https://warpcast.com/${matchText.replace("@", "")}`
            )
          }
        >
          {matchText}
        </span>
      );
    } 
    else if (matchText.startsWith("/")) {
      parts.push(
        <span
          key={`channel-${match.index}`}
          className="text-blue-400 hover:text-blue-500 cursor-pointer"
          onClick={() =>
            sdk.actions.openUrl(`https://warpcast.com/~/channel${matchText}`)
          }
        >
          {matchText}
        </span>
      );
    } 
    else if (matchText.startsWith("http://") || matchText.startsWith("https://") || matchText.startsWith("www.")) {
      const url = matchText.startsWith("www.") ? `https://${matchText}` : matchText;
      parts.push(
        <span
          key={`url-${match.index}`}
          className="text-blue-400 hover:text-blue-500 cursor-pointer"
          onClick={() => sdk.actions.openUrl(url)}
        >
          {matchText}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}

export function Caption({
  post,
  expandedTexts,
  toggleExpandText,
}: CaptionProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-5 w-full pr-16 overflow-hidden bg-gradient-to-t from-black/70 via-black/40 to-transparent pb-14 pt-12">
      <div className="flex flex-col">
        <div className="flex gap-2 items-center">
          <span className="text-white font-semibold truncate">
            {post.author.displayName}
          </span>
          <span className="text-white/80 text-sm">
            {formatTimeAgo(post.timestamp)}
          </span>
        </div>
        <div className="text-white/90 mt-1 flex items-end gap-1 w-full">
          <div
            className="flex-1 flex flex-col w-full"
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandText(post.id);
            }}
          >
            <div
              className={`break-words overflow-hidden overflow-x-hidden ${
                !expandedTexts.has(post.id)
                  ? "line-clamp-2"
                  : "max-h-[60vh] overflow-y-auto"
              } cursor-pointer`}
            >
              <ClickableText text={post.text} />
            </div>
            {post.text.length > 100 && (
              <div className="opacity-60 hover:opacity-80 text-sm font-medium mt-1 cursor-pointer">
                {expandedTexts.has(post.id) ? "Show less" : "Show more"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

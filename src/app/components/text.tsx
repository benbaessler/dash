import { sdk } from "@farcaster/frame-sdk";

interface ClickableTextProps {
  text: string;
}

export function ClickableText({ text }: ClickableTextProps) {
  const parts = [];
  let lastIndex = 0;

  const pattern = /(?<=\s|^)((@[^\s]+|\/[^\s]+)|(https?:\/\/[^\s]+|www\.[^\s]+))/g;
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
              `https://farcaster.xyz/${matchText.replace("@", "")}`
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
            sdk.actions.openUrl(`https://farcaster.xyz/~/channel${matchText}`)
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

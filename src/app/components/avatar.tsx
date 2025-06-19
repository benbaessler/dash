import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import { memo, useState } from "react";

interface AvatarProps {
  imageUrl: string;
  altText: string;
  className?: string;
  fid?: number;
}

const AvatarComponent = ({
  imageUrl,
  altText,
  className = "w-10 h-10", // Default size
  fid,
}: AvatarProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <div className={`relative aspect-square ${className}`}>
      {isImageLoading && (
        <div
          className={`absolute inset-0 rounded-full bg-white animate-pulse ${className}`}
        />
      )}
      <Image
        priority
        src={imageUrl}
        alt={altText}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Default sizes, can be overridden by className
        className={`rounded-full object-cover ${fid ? "cursor-pointer" : ""} ${
          isImageLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsImageLoading(false)}
        onClick={
          fid
            ? (e: React.MouseEvent<HTMLImageElement>) => {
                e.stopPropagation();
                sdk.actions.viewProfile({ fid });
              }
            : undefined
        }
      />
    </div>
  );
};

export const Avatar = memo(AvatarComponent);

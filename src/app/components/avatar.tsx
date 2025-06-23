import Image from "next/image";
import { User } from "@neynar/nodejs-sdk/build/api";
import { useProfile } from "@/providers/ProfileProvider";
import useSWR from "swr";
import { memo, useState } from "react";

interface AvatarProps {
  imageUrl: string;
  altText: string;
  className?: string;
  username?: string;
  fid?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AvatarComponent = ({
  imageUrl,
  altText,
  className = "w-10 h-10", // Default size
  username,
  fid,
}: AvatarProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { openProfile } = useProfile();

  const { data: userData } = useSWR<User>(
    username ? `/api/user/handle/${username}` : fid ? `/api/user/${fid}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  return (
    <>
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
          className={`rounded-full object-cover ${
            username || fid ? "cursor-pointer" : ""
          } ${isImageLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsImageLoading(false)}
          onClick={
            (username || fid) && userData
              ? (e: React.MouseEvent<HTMLImageElement>) => {
                  e.stopPropagation();
                  openProfile(userData);
                }
              : undefined
          }
        />
      </div>
    </>
  );
};

export const Avatar = memo(AvatarComponent);

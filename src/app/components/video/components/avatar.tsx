import Image from "next/image";
import { User } from "@neynar/nodejs-sdk/build/api";
import { useProfile } from "@/providers/ProfileProvider";
import useSWR from "swr";
import { memo } from "react";

interface AvatarProps {
  user: VideoData["author"];
  className?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AvatarComponent = ({ user, className = "w-10 h-10" }: AvatarProps) => {
  const { openProfile } = useProfile();

  const { data: userData } = useSWR<User>(
    user.username
      ? `/api/user/handle/${user.username}`
      : user.fid
      ? `/api/user/${user.fid}`
      : null,
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
        <Image
          // priority
          src={user.pfpUrl}
          alt={user.displayName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`rounded-full object-cover ${
            user.username || user.fid ? "cursor-pointer" : ""
          }`}
          onClick={
            (user.username || user.fid) && userData
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

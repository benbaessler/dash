"use client";

import { User } from "@neynar/nodejs-sdk/build/api";
import { Button } from "@/components/ui/button";
import { ClickableText } from "@/app/components/text";
import { FarcasterIcon } from "@/assets/icons";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import sdk from "@farcaster/frame-sdk";
import { Avatar } from "@/app/components/avatar";
import { Skeleton } from "@/app/components/skeleton";

interface ProfileProps {
  user: User | null;
  onClose: () => void;
}

export function Profile({ user, onClose }: ProfileProps) {
  return (
    <div className="min-h-screen py-4 relative">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <ArrowLeftIcon
            className="w-5 h-5 text-white hover:text-slate-300 transition-colors cursor-pointer"
            onClick={onClose}
          />
          {user ? (
            <h1 className="font-medium">@{user.username}</h1>
          ) : (
            <Skeleton className="h-6 w-24" />
          )}
          <div
            className="cursor-pointer"
            onClick={() =>
              user && sdk.actions.viewProfile({ fid: user.fid })
            }
          >
            <FarcasterIcon className="w-6 h-6 text-white hover:text-slate-300 transition-colors" />
          </div>
        </div>

        <div className="flex justify-center mb-2">
          {user ? (
            <Avatar
              imageUrl={user?.pfp_url || ""}
              altText={user?.username || ""}
              className="w-20 h-20"
            />
          ) : (
            <Skeleton className="w-20 h-20 rounded-full" />
          )}
        </div>

        <div className="text-center mb-2">
          {user ? (
            <h2 className="text-lg font-bold text-white">
              {user.display_name || user.username}
            </h2>
          ) : (
            <Skeleton className="h-7 w-24 mx-auto" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2 max-w-60 mx-auto">
          <div className="text-center">
            {user ? (
              <div className="text-base font-bold text-white">
                {user.following_count}
              </div>
            ) : (
              <Skeleton className="h-6 w-10 mx-auto" />
            )}
            <div className="text-xs text-slate-400">Following</div>
          </div>

          <div className="text-center">
            {user ? (
              <div className="text-base font-bold text-white">
                {user.follower_count}
              </div>
            ) : (
              <Skeleton className="h-6 w-10 mx-auto" />
            )}
            <div className="text-xs text-slate-400">Followers</div>
          </div>

          <div className="text-center">
            {user ? (
              <div className="text-base font-bold text-white">
                0
              </div>
            ) : (
              <Skeleton className="h-6 w-10 mx-auto" />
            )}
            <div className="text-xs text-slate-400">Videos</div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Button
            variant="action"
            size="sm"
            className="max-w-60 w-full"
            disabled={!user}
          >
            Follow
          </Button>
        </div>

        {user?.profile?.bio?.text && (
          <div className="text-center mx-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              <ClickableText text={user.profile.bio.text} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
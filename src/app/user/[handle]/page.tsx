"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { Loading } from "@/app/components/loading";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ClickableText } from "@/app/components/text";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Profile() {
  const { handle } = useParams();

  const { data, isLoading, error } = useSWR<User>(
    `/api/user/handle/${handle}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  if (isLoading) {
    return <Loading text="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-white">
            Profile Not Found
          </h2>
          <p className="text-gray-400">
            The user profile you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-white">No Data</h2>
          <p className="text-gray-400">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-4">
          <h1 className="text-sm text-slate-300">@{data.username}</h1>
        </div>

        <div className="flex justify-center mb-2">
          <Image
            height={80}
            width={80}
            src={data.pfp_url || ""}
            alt={data.username || ""}
            className="rounded-full"
          />
        </div>

        <div className="text-center mb-2">
          <h2 className="text-lg font-bold text-white">
            {data.display_name || data.username}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2 max-w-60 mx-auto">
          <div className="text-center">
            <div className="text-base font-bold text-white">
              {data.following_count}
            </div>
            <div className="text-xs text-slate-400">Following</div>
          </div>

          <div className="text-center">
            <div className="text-base font-bold text-white">
              {data.follower_count}
            </div>
            <div className="text-xs text-slate-400">Followers</div>
          </div>

          <div className="text-center">
            <div className="text-base font-bold text-white">0</div>
            <div className="text-xs text-slate-400">Videos</div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Button variant="action" size="sm" className="max-w-60 w-full">
            Follow
          </Button>
        </div>

        {data.profile?.bio?.text && (
          <div className="text-center mx-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              <ClickableText text={data.profile.bio.text} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

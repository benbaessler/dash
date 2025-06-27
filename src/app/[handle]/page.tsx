"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { Profile } from "@/app/components/profile";
import { useFrame } from "@/providers/FrameProvider";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
  const { handle } = useParams();
  const { context } = useFrame();

  const { data: userData } = useSWR<User>(
    context?.user?.fid
      ? `/api/user/handle/${handle}?viewerFid=${context?.user?.fid}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  return <Profile user={userData || null} />;
}

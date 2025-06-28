"use client";

import { Profile } from "@/app/components/profile";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { useFrame } from "@/providers/FrameProvider";
import { Loading } from "../../components/common/loading";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Page() {
  const { handle } = useParams();
  const { user } = useFrame();

  const { data, isLoading, error } = useSWR<User>(
    handle && user?.fid
      ? `/api/user/handle/${handle}?viewerFid=${user?.fid}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  
  // TODO: handle not found page
  if (!handle || error || (!data && !isLoading)) return null;
  
  if (isLoading) return <Loading />;
  return (
    <div className="fixed inset-0 bg-black z-[10]">
      <Profile user={data!} />
    </div>
  );
}

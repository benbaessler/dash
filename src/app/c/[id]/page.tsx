"use client";

import { Profile } from "@/app/components/profile";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Channel } from "@neynar/nodejs-sdk/build/api";
import { useFrame } from "@/providers/FrameProvider";
import { Loading } from "../../components/common/loading";
import { fetcher } from "@/utils/fetcher";

export default function Page() {
  const { id } = useParams();
  const { sessionToken } = useFrame();

  const { data, isLoading, error } = useSWR<Channel>(
    id && sessionToken ? `/api/channel/${id}` : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  // TODO: handle not found page
  if (!id || error || (!data && !isLoading)) return null;

  if (isLoading) return <Loading />;
  return (
    <div className="fixed inset-0 bg-black z-[10]">
      <Profile type="channel" data={data!} />
    </div>
  );
}

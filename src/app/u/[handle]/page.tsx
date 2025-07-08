"use client";

import { Profile } from "@/app/components/profile";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { useFrame } from "@/providers/FrameProvider";
import { Loading } from "../../components/common/loading";
import { fetcher } from "@/utils/fetcher";

export default function Page() {
  const { handle } = useParams();
  const { sessionToken } = useFrame();

  const { data, isLoading, error } = useSWR<User>(
    handle && sessionToken ? `/api/user/handle/${handle}` : null,
    (url: string) => fetcher(url, sessionToken!),
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
      <Profile type="user" data={data!} />
    </div>
  );
}

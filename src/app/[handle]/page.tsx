"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { Profile } from "@/app/components/profile";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
  const { handle } = useParams();

  const { data: userData } = useSWR<User>(
    `/api/user/handle/${handle}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  return (
    <Profile 
      user={userData || null} 
    />
  );
}

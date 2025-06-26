"use client";

import { useFrame } from "@/providers/FrameProvider";
import { Profile } from "@/app/components/profile";

export default function ProfilePage() {
  const { user } = useFrame();

  return (
    <Profile 
      user={user || null} 
      isCurrentUser={true}
    />
  );
}

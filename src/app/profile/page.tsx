"use client";

import { useFrame } from "@/providers/FrameProvider";;
import { Profile } from "@/app/components/profile";
import { Navbar } from "@/app/components/navbar";

export default function ProfilePage() {
  const { user } = useFrame();

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Profile 
          user={user || null} 
          onClose={() => window.history.back()} 
        />
      </div>
      <Navbar />
    </div>
  );
}

"use client";
import { useFrame } from "@/providers/FrameProvider";
import { Feed } from "./components/feed";
import { useEffect } from "react";
import { ProfileStack } from "./components/profile-stack";
import { Navbar } from "./components/navbar";

export default function App() {
  const { sessionToken, signIn } = useFrame();

  useEffect(() => {
    if (!sessionToken) signIn();
  }, [sessionToken, signIn]);

  return (
    <div className="h-screen w-screen flex flex-col">
      <Feed />
      <Navbar />
      <ProfileStack />
    </div>
  );
}

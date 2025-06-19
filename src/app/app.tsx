"use client";
import { useFrame } from "@/providers/FrameProvider";
import { Feed } from "./components/feed";
import { useEffect } from "react";

export default function App() {
  const { sessionToken, signIn } = useFrame();

  useEffect(() => {
    if (!sessionToken) signIn();
  }, [sessionToken, signIn]);

  return <Feed />;
}

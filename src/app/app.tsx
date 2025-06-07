"use client";
import { Feed } from "./components/feed";
import { ProfileStack } from "./components/profile-stack";
import { Navbar } from "./components/navbar";

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <Feed />
      <Navbar />
      <ProfileStack />
    </div>
  );
}

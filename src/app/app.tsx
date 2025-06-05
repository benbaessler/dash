"use client";
import { Feed } from "./components/feed";
import { ProfileOverlay } from "./components/profile-overlay";
import { Navbar } from "./components/navbar";

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <Feed />
      <Navbar />
      <ProfileOverlay />
    </div>
  );
}

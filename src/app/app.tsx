"use client";
import { useState } from "react";
import { VideoPlayer } from "./components/video-player";

const videos = [
  "https://stream.warpcast.com/v1/video/01964433-5ec7-26c7-8d8d-8e6928a9b7f7.m3u8",
  "https://stream.warpcast.com/v1/video/01964525-1bb0-4fe6-16df-338a5b9bda80.m3u8"
];

export default function App() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);
    
    if (newIndex !== activeVideoIndex) {
      setActiveVideoIndex(newIndex);
    }
  };

  return (
    <main
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {videos.map((videoUrl, index) => (
        <div
          key={index}
          className="h-screen w-screen snap-start"
        >
          <VideoPlayer
            src={videoUrl}
            isActive={index === activeVideoIndex}
          />
        </div>
      ))}
    </main>
  );
}

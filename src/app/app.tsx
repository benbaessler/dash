"use client";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./components/video-player";

import { casts } from "./test/data";

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
      {casts.map((cast, index) => (
        <div key={index} className="h-screen w-screen snap-start">
          <VideoPlayer cast={cast} isActive={index === activeVideoIndex} />
        </div>
      ))}
    </main>
  );
}

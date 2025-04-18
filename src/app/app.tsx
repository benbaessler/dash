"use client";
import ReactPlayer from "react-player";
import { useState } from "react";

const videoUrl =
  "https://stream.warpcast.com/v1/video/01964433-5ec7-26c7-8d8d-8e6928a9b7f7.m3u8";

const wrongFormatUrl =
  "https://stream.warpcast.com/v1/video/01964525-1bb0-4fe6-16df-338a5b9bda80.m3u8";

export default function App() {
  const [playing, setPlaying] = useState(true);

  return (
    <main
      className="min-h-screen flex items-center justify-center cursor-pointer"
      onClick={() => setPlaying(!playing)}
    >
      <ReactPlayer
        width="100%"
        height="100%"
        playing={playing}
        volume={1}
        loop={true}
        url={videoUrl}
      />
    </main>
  );
}

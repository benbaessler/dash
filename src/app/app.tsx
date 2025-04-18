"use client";
import ReactPlayer from "react-player";

const videoUrl =
  "https://stream.warpcast.com/v1/video/01964433-5ec7-26c7-8d8d-8e6928a9b7f7.m3u8";

export default function App() {
  return (
    <main>
      <ReactPlayer
        width="100%"
        height="100%"
        playing={true}
        volume={1}
        loop={true}
        url={videoUrl}
      />
    </main>
  );
}

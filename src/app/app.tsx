"use client";
import ReactPlayer from "react-player";
import { useEffect, useState } from "react";
import { useFrame } from "~/components/providers/FrameProvider";
import { InteractionButtons } from "./components/interaction-buttons";
import { PlayIcon } from "@heroicons/react/24/solid";

const videoUrl =
  "https://stream.warpcast.com/v1/video/01964433-5ec7-26c7-8d8d-8e6928a9b7f7.m3u8";

const wrongFormatUrl =
  "https://stream.warpcast.com/v1/video/01964525-1bb0-4fe6-16df-338a5b9bda80.m3u8";

export default function App() {
  const { isSDKLoaded, context } = useFrame();
  // TODO: disabled for development
  const [playing, setPlaying] = useState(false);
  const [feed, setFeed] = useState([]);

  const [liked, setLiked] = useState(false);
  const [recasted, setRecasted] = useState(false);
  const [playTimeout, setPlayTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchFeed = async () => {
    const response = await fetch(`/api/feed/${context?.user.fid}`);
    const { data } = await response.json();
    console.log(data);
    setFeed(data);
  };

  const handleClick = () => {
    if (playTimeout) {
      clearTimeout(playTimeout);
      setPlayTimeout(null);
      return;
    }

    const timeout = setTimeout(() => {
      setPlaying(!playing);
      setPlayTimeout(null);
    }, 300);

    setPlayTimeout(timeout);
  };

  // useEffect(() => {
  //   if (isSDKLoaded && context?.user.fid) {
  //     fetchFeed();
  //   }
  // }, [isSDKLoaded, context]);

  // useEffect(() => {
  //   console.log(feed);
  // }, [feed]);

  return (
    <main
      className="min-h-screen flex items-center justify-center relative"
      onClick={handleClick}
      onDoubleClick={() => setLiked(true)}
    >
      <ReactPlayer
        width="100%"
        height="100%"
        playing={playing}
        volume={1}
        loop={true}
        url={videoUrl}
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayIcon className="size-12 text-white opacity-70 cursor-pointer" />
        </div>
      )}
      <InteractionButtons
        liked={liked}
        setLiked={setLiked}
        recasted={recasted}
        setRecasted={setRecasted}
      />
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./components/video-player";
import { ApproveSignerDialog } from "./components/approve-signer-dialog";
import { useSigner } from "@/hooks/useSigner";
import { useFrame } from "@/providers/FrameProvider";

export default function App() {
  const { isSDKLoaded, context } = useFrame();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showSignerDialog, setShowSignerDialog] = useState(false);
  const { signer, createSigner } = useSigner();
  const [feed, setFeed] = useState<Post[]>([]);
  const [scrollCount, setScrollCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleApproveSigner = async () => {
    setLoading(true);
    if (!signer) {
      await createSigner();
    }
    setShowSignerDialog(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);

    if (newIndex !== activeVideoIndex) {
      setActiveVideoIndex(newIndex);
      setScrollCount((prev) => prev + 1);

      // Fetch more content when user has scrolled through 5 videos
      if ((scrollCount + 1) % 5 === 0) {
        fetchFeed(5);
      }
    }
  };

  const fetchFeed = async (limit: number = 10) => {
    const response = await fetch(
      `/api/feed/${context?.user.fid}?limit=${limit}`
    );
    const { data } = await response.json();
    setFeed((prevFeed) => [...prevFeed, ...data]);
  };

  useEffect(() => {
    if (isSDKLoaded && context?.user.fid) {
      fetchFeed();
    }
  }, [isSDKLoaded, context]);

  return (
    <main
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory relative"
      onScroll={handleScroll}
    >
      {feed.map((post, index) => (
        <div key={index} className="h-screen w-screen snap-start">
          <VideoPlayer 
            post={post} 
            isActive={index === activeVideoIndex} 
            handleApproveSigner={handleApproveSigner}
            loading={loading}
          />
        </div>
      ))}
      <ApproveSignerDialog
        open={showSignerDialog}
        onOpenChange={setShowSignerDialog}
        setLoading={setLoading}
      />
    </main>
  );
}

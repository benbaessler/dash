"use client";
import { useEffect, useState } from "react";
import { VideoPlayer } from "./components/video-player";
import { ApproveSignerButton } from "./components/approve-signer-button";
import { SignerModal } from "./components/signer-modal";
import { useUser } from "@/hooks/useUser";
import { useFrame } from "@/providers/FrameProvider";

export default function App() {
  const { isSDKLoaded, context } = useFrame();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showSignerDialog, setShowSignerDialog] = useState(false);
  const { signer, handleSignIn, loading } = useUser();
  const [feed, setFeed] = useState<Post[]>([]);

  const handleSignInClick = async () => {
    if (!signer) {
      await handleSignIn();
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
    }
  };

  const fetchFeed = async () => {
    const response = await fetch(`/api/feed/${context?.user.fid}`);
    const { data } = await response.json();
    setFeed(data);
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
      {signer?.status !== "approved" && (
        <ApproveSignerButton onClick={handleSignInClick} loading={loading} />
      )}
      {feed.map((post, index) => (
        <div key={index} className="h-screen w-screen snap-start">
          <VideoPlayer post={post} isActive={index === activeVideoIndex} />
        </div>
      ))}
      <SignerModal
        showDialog={showSignerDialog}
        setShowDialog={setShowSignerDialog}
      />
    </main>
  );
}

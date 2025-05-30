import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FarcasterIcon } from "@/assets/icons";
import { appUrl } from "@/constants";
import sdk from "@farcaster/frame-sdk";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useFrame } from "@/providers/FrameProvider";
import { usePostHog } from "posthog-js/react";
import { HeartIcon, CheckIcon } from "@heroicons/react/24/solid";
import { usePost } from "@/hooks/usePost";

type PromotionProps = {
  type: "add-frame" | "share-app" | "join-channel" | "like-rpgf";
};

function AddFramePromotion() {
  const { context } = useFrame();
  const added = useMemo(() => context?.client.added, [context]);
  const [ref, inView] = useInView({
    threshold: 1,
  });

  useEffect(() => {
    if (inView && !added) {
      sdk.actions.addFrame();
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-12 text-center gap-12"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <Image src="/icon.png" alt="Dash Logo" width={90} height={90} />
        <h1 className="text-3xl font-semibold">Enjoying Dash?</h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 font-regular">
        {added ? (
          <p className="text-lg">
            Consider sharing the mini app with your friends!
          </p>
        ) : (
          <>
            <p className="text-lg">
              {`Add the mini app to Warpcast so you don't miss out on updates! 👀`}
            </p>

            <p className="text-gray-400 text-md">
              {`Don't worry, notifications will be kept to a minimum.`}
            </p>
          </>
        )}
      </div>

      <ShareButton />
    </div>
  );
}

function ShareAppPromotion() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-12 text-center gap-12">
      <div className="flex flex-col items-center justify-center gap-2">
        <Image src="/icon.png" alt="Dash Logo" width={90} height={90} />
        <h1 className="text-3xl font-semibold">Enjoying Dash?</h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 font-regular">
        <p className="text-lg">
          Consider sharing the mini app with your friends!
        </p>
      </div>

      <ShareButton />
    </div>
  );
}

const LikeRPGFPromotion = () => {
  const { sessionToken } = useFrame();
  const { checkAuth } = usePost();
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    const authorized = await checkAuth();
    if (!authorized) return;

    setLiked(true);

    const response = await fetch("/api/reactions/publish", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        castHash: "0x02808f8108a026e2d1db54b05dd2aefb9f7fb41e",
        type: "like",
      }),
    });

    if (!response.ok) setLiked(false);
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-12 text-center gap-12">
      <div className="flex flex-col items-center justify-center gap-2">
        <Image src="/icon.png" alt="Dash Logo" width={90} height={90} />
        <h1 className="text-3xl font-semibold">Support with a tap!</h1>
      </div>

      <HeartIcon
        className={`w-20 h-20 hover:cursor-pointer ${
          liked
            ? "text-red-500 animate-heartbeat"
            : "text-gray-400 animate-pulse"
        }`}
        onClick={handleLike}
      />

      <div className="flex flex-col items-center justify-center gap-4 font-regular text-slate-200">
        <p>
          {`Tap the like to boost the project's allocation in the Farcaster Spring 2025 RPGF funding round.`}
        </p>

        <p
          onClick={() => {
            sdk.actions.openUrl(
              "https://farcaster.xyz/benbassler.eth/0x02808f81"
            );
          }}
          className="opacity-60 hover:opacity-70 cursor-pointer"
        >
          View the cast
        </p>

        {liked && (
          <div className="flex items-center gap-1 bg-green-800/70 px-3 py-2 rounded-lg mt-6">
            <CheckIcon className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400">Thank you!</span>
          </div>
        )}
      </div>
    </div>
  );
};

function JoinChannelPromotion() {
  const { capture } = usePostHog();
  const { context } = useFrame();

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-12 text-center gap-12">
      <div className="flex flex-col items-center justify-center gap-2">
        <Image src="/icon.png" alt="Dash Logo" width={90} height={90} />
        <h1 className="text-3xl font-semibold">{`What's missing on Dash?`}</h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 font-regular">
        <p className="text-lg">
          Join the /dash channel, share your ideas, and shape what comes next.
        </p>
      </div>

      <Button
        variant="action"
        className="w-full text-md [&_svg]:!size-5 gap-2"
        onClick={async () => {
          await sdk.actions.openUrl(`https://warpcast.com/~/channel/dash`);

          capture("Opened /dash channel", {
            fid: context?.user?.fid.toString(),
            username: context?.user?.username,
          });
        }}
      >
        <FarcasterIcon />
        Join channel
      </Button>
    </div>
  );
}

function ShareButton() {
  const { capture } = usePostHog();
  const { context } = useFrame();

  return (
    <Button
      variant="action"
      className="w-full text-md [&_svg]:!size-5 gap-2"
      onClick={async () => {
        const result = await sdk.actions.composeCast({
          text: "Scroll your feed TikTok-style on /dash! ⚡️",
          embeds: [appUrl!],
        });

        if (result && result.cast) {
          capture("Shared app", {
            senderFid: context?.user?.fid.toString(),
            castHash: result.cast.hash,
          });
        }
      }}
    >
      <FarcasterIcon />
      Share to support
    </Button>
  );
}

export function Promotion({ type }: PromotionProps) {
  return type === "add-frame" ? (
    <AddFramePromotion />
  ) : type === "share-app" ? (
    <ShareAppPromotion />
  ) : type === "join-channel" ? (
    <JoinChannelPromotion />
  ) : (
    <LikeRPGFPromotion />
  );
}

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FarcasterIcon } from "@/assets/icons";
import { appUrl } from "@/constants";
import sdk from "@farcaster/frame-sdk";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useFrame } from "@/providers/FrameProvider";
import { usePostHog } from "posthog-js/react";

type PromotionProps = {
  type: "add-frame" | "share-app";
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

function ShareButton() {
  const { capture } = usePostHog();
  const { context } = useFrame();

  return (
    <Button
      variant="action"
      className="w-full text-md [&_svg]:!size-5 gap-2"
      onClick={async () => {
        const result = await sdk.actions.composeCast({
          text: "Scroll your feed TikTok-style on Dash! ⚡️",
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
  return type === "add-frame" ? <AddFramePromotion /> : <ShareAppPromotion />;
}

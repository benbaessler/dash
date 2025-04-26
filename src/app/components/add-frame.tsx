import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FarcasterIcon } from "@/assets/icons";
import { generateCastIntentURL } from "@/utils/generateCastIntent";
import { appUrl } from "@/constants";
import sdk from "@farcaster/frame-sdk";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useFrame } from "@/providers/FrameProvider";

export function AddFramePage() {
  const { context } = useFrame();
  const added = useMemo(() => context?.client.added, [context]);
  const [ref, inView] = useInView({
    threshold: 1,
  });

  const castIntent = generateCastIntentURL(
    "Scroll your feed TikTok-style on Dash! ⚡️",
    appUrl!
  );

  useEffect(() => {
    if (inView && !added) {
      sdk.actions.addFrame();
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className="bg-black text-white min-h-screen flex flex-col items-center py-16 px-12 text-center"
    >
      <div className="flex flex-col items-center justify-center mb-14 gap-2">
        <Image src="/icon.png" alt="Dash Logo" width={90} height={90} />

        <h1 className="text-3xl font-semibold">{`Enjoying Dash?`}</h1>
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

      <div className="flex flex-grow w-full justify-center items-center">
        <div className="flex flex-col gap-4 w-full">
          {!added && (
            <Button
              variant="ghost"
              className="w-full text-md [&_svg]:!size-5 gap-2"
              onClick={() => sdk.actions.addFrame()}
            >
              <PlusCircleIcon />
              Add Mini App
            </Button>
          )}
          <Button
            variant="action"
            className="w-full text-md [&_svg]:!size-5 gap-2"
            onClick={() => sdk.actions.openUrl(castIntent)}
          >
            <FarcasterIcon />
            Share to support
          </Button>
        </div>
      </div>
    </div>
  );
}

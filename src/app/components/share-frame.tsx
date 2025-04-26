import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FarcasterIcon } from "@/assets/icons";
import { generateCastIntentURL } from "@/utils/generateCastIntent";
import { appUrl } from "@/constants";
import sdk from "@farcaster/frame-sdk";
import { useEffect } from "react";

export function ShareFrame() {
  const castIntent = generateCastIntentURL(
    "Explore videos on Farcaster with Dash! 📲",
    appUrl!
  );

  useEffect(() => {
    sdk.actions.addFrame();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center py-16 px-12 text-center">
      <div className="flex flex-col items-center justify-center mb-14 gap-2">
        <Image src="/icon.png" alt="Dash Logo" width={90} height={90} />

        <h1 className="text-3xl font-medium">{`Enjoying Dash?`}</h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 font-regular">
        <p className="text-lg">
          {`Add the mini app to Warpcast so you don't miss out on updates! 👀`}
        </p>

        <p className="text-gray-400 text-md">
          {`Don't worry, notifications will be kept to a minimum.`}
        </p>
      </div>

      <div className="flex flex-grow w-full justify-center items-center">
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
  );
}

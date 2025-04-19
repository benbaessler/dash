import { ArrowPathIcon, HeartIcon } from "@heroicons/react/24/solid";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/api";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
interface InteractionButtonsProps {
  cast: CastWithInteractions;
  liked: boolean;
  setLiked: (liked: boolean) => void;
  recasted: boolean;
  setRecasted: (recasted: boolean) => void;
}

export const InteractionButtons = ({
  cast,
  liked,
  setLiked,
  recasted,
  setRecasted,
}: InteractionButtonsProps) => {
  return (
    <div className="flex flex-col gap-4 font-semibold">
      <Image
        src={cast.author.pfp_url ?? ""}
        alt={cast.author.display_name ?? ""}
        width={38}
        height={38}
        className="w-10 h-10 rounded-full object-cover cursor-pointer"
        onClick={async () => {
          await sdk.actions.viewProfile({ fid: cast.author.fid });
        }}
      />
      <div className="flex flex-col items-center">
        <HeartIcon
          className={`size-9 cursor-pointer ${
            liked ? "text-red-400" : "text-white"
          } ${liked ? "opacity-100" : "opacity-70"}`}
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
        />
        <span className="text-white text-sm">{cast.reactions.likes_count}</span>
      </div>
      <div className="flex flex-col items-center">
        <ArrowPathIcon
          className={`size-9 cursor-pointer ${
            recasted ? "text-green-400" : "text-white"
          } ${recasted ? "opacity-100" : "opacity-70"}`}
          onClick={(e) => {
            e.stopPropagation();
            setRecasted(!recasted);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
        />
        <span className="text-white text-sm">
          {cast.reactions.recasts_count}
        </span>
      </div>
    </div>
  );
};

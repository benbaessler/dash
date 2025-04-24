import { ArrowPathIcon, HeartIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
interface InteractionButtonsProps {
  post: Post;
  liked: boolean;
  setLiked: (liked: boolean) => void;
  recasted: boolean;
  setRecasted: (recasted: boolean) => void;
}

export const InteractionButtons = ({
  post,
  liked,
  setLiked,
  recasted,
  setRecasted,
}: InteractionButtonsProps) => {

  const handleInteraction = async (
    e: React.MouseEvent,
    type: "like" | "recast"
  ) => {
    e.stopPropagation();
    // if (!signer || signer.status !== "approved") {
    //   await handleSignIn();
    // }

    if (type === "like") {
      setLiked(!liked);
    } else if (type === "recast") {
      setRecasted(!recasted);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <Image
        src={post.author.pfpUrl ?? ""}
        alt={post.author.displayName ?? ""}
        width={38}
        height={38}
        className="w-10 h-10 rounded-full object-cover cursor-pointer"
        onClick={async (e) => {
          e.stopPropagation();
          await sdk.actions.viewProfile({ fid: post.author.fid });
        }}
      />
      <div
        className={`flex flex-col items-center ${
          liked ? "text-red-400" : "text-white"
        }`}
      >
        <HeartIcon
          className={`size-9 cursor-pointer  ${
            liked ? "opacity-100" : "opacity-80"
          }`}
          onClick={(e) => handleInteraction(e, "like")}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <span className="text-sm">{post.likeCount}</span>
      </div>
      <div
        className={`flex flex-col items-center ${
          recasted ? "text-green-400" : "text-white"
        }`}
      >
        <ArrowPathIcon
          className={`size-9 cursor-pointer ${
            recasted ? "opacity-100" : "opacity-80"
          }`}
          onClick={(e) => handleInteraction(e, "recast")}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <span className="text-sm">{post.recastCount}</span>
      </div>
      <div
        className="w-9 h-9 opacity-80 hover:opacity-100 cursor-pointer rounded-full"
        onClick={() => {
          sdk.actions.openUrl(
            `https://warpcast.com/${post.author.username}/${post.id}`
          );
        }}
      >
        <Image
          src="/icons/farcaster.png"
          alt="View cast"
          className="w-full h-full object-cover rounded-full"
          width={30}
          height={30}
        />
      </div>
    </div>
  );
};

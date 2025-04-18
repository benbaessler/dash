import { ArrowPathIcon, HeartIcon } from "@heroicons/react/24/solid";

interface InteractionButtonsProps {
  liked: boolean;
  setLiked: (liked: boolean) => void;
  recasted: boolean;
  setRecasted: (recasted: boolean) => void;
}

export const InteractionButtons = ({
  liked,
  setLiked,
  recasted,
  setRecasted,
}: InteractionButtonsProps) => {
  return (
    <div className="absolute right-4 flex flex-col gap-4">
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
        <span className="text-white text-sm">0</span>
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
        <span className="text-white text-sm">0</span>
      </div>
    </div>
  );
};

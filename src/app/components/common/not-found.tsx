import { SmileySadIcon } from "@phosphor-icons/react";

export const NotFound = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[40]">
      <div className="flex flex-col items-center -mt-[55px]">
        <SmileySadIcon size={85} className="opacity-60" />
        <div className="mt-2 text-gray-400 text-sm text-center whitespace-nowrap">
          {"Couldn't find what you're looking for"}
        </div>
      </div>
    </div>
  );
}

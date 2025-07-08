import Image from "next/image";

interface Props {
  zIndex?: number;
}

export function Loading({ zIndex = 40 }: Props) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black z-[${zIndex}]`}
    >
      <div className="flex flex-col items-center -mt-[55px]">
        <Image
          priority
          src="/splash.png"
          alt="logo"
          width={85}
          height={85}
          className="animate-pulse"
        />
        <div className="mt-2 text-gray-400 text-sm flex justify-center">
          <span>Loading</span>
        </div>
      </div>
    </div>
  );
}

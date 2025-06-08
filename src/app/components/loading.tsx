import Image from "next/image";

export function Loading({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      <div className="flex flex-col items-center -mt-[55px]">
        <Image 
          src="/splash.png" 
          alt="logo" 
          width={85} 
          height={85} 
          className="animate-pulse"
        />
        <div className="mt-2 text-gray-400 text-sm text-center whitespace-nowrap">
          {text || "Building a feed for you"}
        </div>
      </div>
    </div>
  );
}

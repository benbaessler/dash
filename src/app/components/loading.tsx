import { useEffect, useState } from "react";
import Image from "next/image";

export function Loading() {
  const [loadingDots, setLoadingDots] = useState("");

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setLoadingDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 300);

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center -mt-[55px]">
        <Image 
          src="/splash.png" 
          alt="logo" 
          width={85} 
          height={85} 
          className="animate-pulse"
        />
        <div className="mt-2 text-gray-400 text-sm w-[218px] text-center whitespace-nowrap">
          Generating a tailored feed for you{loadingDots}
        </div>
      </div>
    </div>
  );
}

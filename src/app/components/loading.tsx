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
    <div className="flex justify-center items-center h-screen w-screen bg-black">
      <div className="flex flex-col justify-center items-center gap-2">
        <Image 
          src="/icon.png" 
          alt="logo" 
          width={120} 
          height={120} 
          className="animate-pulse"
        />
        <div className="text-gray-400 text-sm w-[200px] text-center whitespace-nowrap">
          Creating a tailored feed for you{loadingDots}
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import { useEffect, useState } from "react";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[40]">
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

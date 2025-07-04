"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useFrame } from "@/providers/FrameProvider";
import sdk from "@farcaster/frame-sdk";
import {
  UserIcon,
  HouseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

export function Navbar({
  selected,
  onTabChange,
}: {
  selected: Tab | null;
  onTabChange: (tab: Tab | null) => void;
}) {
  const { trackEvent } = useAnalytics();
  const { user } = useFrame();

  const navItems = [
    {
      icon: <HouseIcon weight="bold" size={28} />,
      selectedIcon: <HouseIcon weight="fill" size={28} />,
      selected: selected === "home",
      label: "home" as const,
    },
    {
      icon: <PlusIcon weight="bold" size={28} />,
      selectedIcon: <PlusIcon weight="bold" size={28} />,
      selected: false,
      label: "create" as const,
    },
    {
      icon: <MagnifyingGlassIcon weight="bold" size={28} />,
      selectedIcon: <MagnifyingGlassIcon weight="fill" size={28} />,
      selected: selected === "search",
      label: "search" as const,
    },
    {
      icon: <UserIcon weight="bold" size={28} />,
      selectedIcon: <UserIcon weight="fill" size={28} />,
      selected: selected === "profile",
      label: "profile" as const,
    },
  ];

  return (
    <nav className="bg-black border-t border-gray-800 z-[50]">
      <div className="flex items-center justify-around pb-6 pt-2 max-w-sm mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.selected ? item.selectedIcon : item.icon;

          return (
            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={item.label}
              className="flex flex-col items-center justify-center p-2 space-y-1 rounded-lg transition-colors duration-200 min-w-[64px]"
              onClick={async () => {
                if (item.label === "create") {
                  trackEvent("clicked_upload_btn", {
                    user: user?.username,
                  });
                  return await sdk.actions.composeCast({
                    text: "[upload your video here]",
                  });
                }

                await sdk.haptics.impactOccurred("light");
                onTabChange(item.label);

                if (item.label === "profile") {
                  trackEvent("opened_own_profile", {
                    user: user?.username,
                  });
                }
              }}
            >
              {IconComponent}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

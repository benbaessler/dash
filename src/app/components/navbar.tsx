"use client";

import { UserIcon, HouseIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function Navbar({ selected }: { selected: "home" | "profile" }) {
  const router = useRouter();

  const navItems = [
    {
      icon: <HouseIcon size={28} />,
      selectedIcon: <HouseIcon weight="fill" size={28} />,
      label: "Home",
      href: "/",
      selected: selected === "home",
    },
    {
      icon: <UserIcon size={28} />,
      selectedIcon: <UserIcon weight="fill" size={28} />,
      label: "Profile",
      href: "/profile",
      selected: selected === "profile",
    },
  ];

  return (
    <nav className="bg-black border-t border-gray-800 z-[10]">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around pb-6 pt-2">
          {navItems.map((item) => {
            const IconComponent = item.selected ? item.selectedIcon : item.icon;

            return (
              <button
                key={item.label}
                className="flex flex-col items-center justify-center p-2 space-y-1 rounded-lg transition-colors duration-200 min-w-[64px]"
                onClick={() => {
                  router.push(item.href);
                }}
              >
                {IconComponent}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

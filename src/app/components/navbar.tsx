"use client";

import { UserIcon, HouseIcon } from "@phosphor-icons/react";

export function Navbar({
  selected,
  onTabChange,
}: {
  selected: "home" | "profile" | null;
  onTabChange: (tab: "home" | "profile" | null) => void;
}) {
  const navItems = [
    {
      icon: <HouseIcon weight="bold" size={28} />,
      selectedIcon: <HouseIcon weight="fill" size={28} />,
      selected: selected === "home",
      label: "home" as const,
    },
    {
      icon: <UserIcon weight="bold" size={28} />,
      selectedIcon: <UserIcon weight="fill" size={28} />,
      selected: selected === "profile",
      label: "profile" as const,
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
                  onTabChange(item.label);
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

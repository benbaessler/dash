"use client";

import { UserCircleIcon, BoltIcon } from "@heroicons/react/24/outline";
import {
  UserCircleIcon as SelectedUserCircleIcon,
  BoltIcon as SelectedBoltIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";

export function Navbar() {
  const [selectedTab, setSelectedTab] = useState("/");

  const navItems = [
    {
      icon: BoltIcon,
      selectedIcon: SelectedBoltIcon,
      label: "Home",
      href: "/",
    },
    {
      icon: UserCircleIcon,
      selectedIcon: SelectedUserCircleIcon,
      label: "Profile",
      href: "/profile",
    },
  ];

  return (
    <nav className="bg-black">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around pb-6 pt-2">
          {navItems.map((item) => {
            const isSelected = selectedTab === item.href;
            const IconComponent = isSelected ? item.selectedIcon : item.icon;
            
            return (
              <button
                key={item.label}
                className="flex flex-col items-center justify-center p-2 space-y-1 rounded-lg transition-colors duration-200 min-w-[64px]"
                onClick={() => {
                  setSelectedTab(item.href);
                  console.log(`Navigate to ${item.href}`);
                }}
              >
                <IconComponent 
                  className={`w-7 h-7 transition-colors duration-200 ${
                    isSelected 
                      ? "text-white" 
                      : "text-gray-400 hover:text-gray-200"
                  }`} 
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

"use client";

import { UserCircleIcon, BoltIcon } from "@heroicons/react/24/outline";
import {
  UserCircleIcon as SelectedUserCircleIcon,
  BoltIcon as SelectedBoltIcon,
} from "@heroicons/react/24/solid";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

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
    <nav className="bg-black border-t border-gray-800">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around pb-6 pt-2">
          {navItems.map((item) => {
            const isSelected = pathname === item.href;
            const IconComponent = isSelected ? item.selectedIcon : item.icon;
            
            return (
              <button
                key={item.label}
                className="flex flex-col items-center justify-center p-2 space-y-1 rounded-lg transition-colors duration-200 min-w-[64px]"
                onClick={() => {
                  router.push(item.href);
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

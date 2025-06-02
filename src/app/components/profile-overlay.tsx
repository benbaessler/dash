"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/providers/ProfileProvider";
import { Profile } from "@/app/components/profile";

export function ProfileOverlay() {
  const { isProfileOpen, profileUser, closeProfile, setProfileVisible } = useProfile();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isProfileOpen) {
      // Start animation after a brief delay to ensure the component is mounted
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      // Set profile as visible after animation completes
      setTimeout(() => {
        setProfileVisible(true);
      }, 300);
    } else {
      setIsAnimating(false);
      setProfileVisible(false);
    }
  }, [isProfileOpen, setProfileVisible]);

  if (!profileUser) return null;

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full bg-black z-[100] transform transition-transform duration-300 ease-out ${
        isProfileOpen && isAnimating ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <Profile 
        user={profileUser} 
        onClose={closeProfile} 
      />
    </div>
  );
}
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@neynar/nodejs-sdk/build/api";

interface ProfileContextType {
  isProfileOpen: boolean;
  isProfileVisible: boolean;
  profileUser: User | null;
  openProfile: (user: User) => void;
  closeProfile: () => void;
  setProfileVisible: (visible: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  const openProfile = (user: User) => {
    setProfileUser(user);
    setIsProfileOpen(true);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
    setIsProfileVisible(false);
    setProfileUser(null);
  };

  const setProfileVisible = (visible: boolean) => {
    setIsProfileVisible(visible);
  };

  return (
    <ProfileContext.Provider value={{ isProfileOpen, isProfileVisible, profileUser, openProfile, closeProfile, setProfileVisible }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
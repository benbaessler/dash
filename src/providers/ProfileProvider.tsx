"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { User } from "@neynar/nodejs-sdk/build/api";

interface ProfileStackItem {
  id: string;
  user: User;
  timestamp: number;
}

interface ProfileContextType {
  profileStack: ProfileStackItem[];
  openProfile: (user: User) => void;
  closeProfile: (id?: string) => void;
  closeAllProfiles: () => void;
  isStackOpen: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const MAX_STACK_SIZE = 3;

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileStack, setProfileStack] = useState<ProfileStackItem[]>([]);

  const openProfile = useCallback((user: User) => {
    const id = `${user.fid}-${Date.now()}`;
    const newProfile: ProfileStackItem = {
      id,
      user,
      timestamp: Date.now(),
    };

    setProfileStack(prev => {
      const newStack = [...prev, newProfile];
      // Keep only the last MAX_STACK_SIZE profiles
      return newStack.slice(-MAX_STACK_SIZE);
    });
  }, []);

  const closeProfile = useCallback((id?: string) => {
    setProfileStack(prev => {
      if (!id) {
        // Close the top profile if no ID specified
        return prev.slice(0, -1);
      }
      // Close specific profile by ID
      return prev.filter(profile => profile.id !== id);
    });
  }, []);

  const closeAllProfiles = useCallback(() => {
    setProfileStack([]);
  }, []);

  const isStackOpen = profileStack.length > 0;

  return (
    <ProfileContext.Provider value={{ 
      profileStack, 
      openProfile, 
      closeProfile, 
      closeAllProfiles, 
      isStackOpen 
    }}>
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
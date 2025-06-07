"use client";

import { motion, AnimatePresence, PanInfo } from "motion/react";
import { useProfile } from "@/providers/ProfileProvider";
import { Profile } from "@/app/components/profile";
import { useCallback } from "react";

export function ProfileStack() {
  const { profileStack, closeProfile, closeAllProfiles } = useProfile();

  const handleDragEnd = useCallback((
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    profileId: string
  ) => {
    const threshold = 150;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Close if dragged far enough or with sufficient velocity
    if (offset > threshold || velocity > 500) {
      closeProfile(profileId);
    }
  }, [closeProfile]);

  const handleBackdropClick = useCallback((index: number) => {
    // Close all profiles above this one
    const profilesToClose = profileStack.slice(index + 1);
    profilesToClose.forEach(profile => closeProfile(profile.id));
  }, [profileStack, closeProfile]);

  return (
    <AnimatePresence mode="popLayout">
      {profileStack.map((profile, index) => {
        const isTop = index === profileStack.length - 1;
        const zIndex = 100 + index;
        const backdropOpacity = Math.min(0.4 + (index * 0.1), 0.7);
        
        return (
          <motion.div
            key={profile.id}
            className="fixed inset-0"
            style={{ zIndex }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.2 }
            }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: backdropOpacity }}
              exit={{ opacity: 0 }}
              onClick={() => handleBackdropClick(index)}
            />
            
            {/* Profile Panel */}
            <motion.div
              className="absolute top-0 right-0 h-full w-full bg-black"
              initial={{ 
                x: "100%",
                scale: 1
              }}
              animate={{ 
                x: 0,
                scale: isTop ? 1 : 0.95
              }}
              exit={{ 
                x: "100%",
                transition: { 
                  type: "spring",
                  damping: 30,
                  stiffness: 300
                }
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.8
              }}
              drag={isTop ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.5 }}
              onDragEnd={(event, info) => handleDragEnd(event, info, profile.id)}
              dragMomentum={false}
              style={{
                transform: isTop ? undefined : `translateX(${-20 * (profileStack.length - 1 - index)}px)`,
              }}
            >
              <Profile 
                user={profile.user} 
                onClose={() => closeProfile(profile.id)}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
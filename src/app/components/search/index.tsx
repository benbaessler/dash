"use client";

import { useState } from "react";
import { SearchBar } from "../common/search-bar";
import { useFrame } from "@/providers/FrameProvider";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Profile } from "../profile";
import { useAnalytics } from "@/hooks/useAnalytics";
import { UserResult } from "./components/user-result";
import { fetcher } from "@/utils/fetcher";

export const SearchPage = () => {
  const [search, setSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { trackEvent } = useAnalytics();

  const { sessionToken } = useFrame();

  const handleUserClick = (user: User, fromTrending: boolean = false) => {
    setSelectedUser(user);
    setIsProfileOpen(true);

    trackEvent(fromTrending ? "opened_trending_user" : "opened_from_search", {
      type: "user",
      targetFid: user.fid,
    });

    if (!fromTrending)
      fetch("/api/search/track", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          type: "user",
          queryId: user.fid,
        }),
      });
  };

  const searchKey =
    sessionToken && search.trim().length > 0
      ? `/api/search/users?query=${encodeURIComponent(search)}`
      : null;

  const { data: results, isLoading: isResultsLoading } = useSWR<User[]>(
    searchKey,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: trendingResults, isLoading: isTrendingLoading } = useSWR<
    User[]
  >(
    sessionToken ? `/api/search/trending` : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const isLoading = isResultsLoading || isTrendingLoading;

  return (
    <>
      <motion.div
        className="h-full max-h-[calc(100vh-64px)] overflow-y-auto p-4"
        animate={{
          x: isProfileOpen ? "-50%" : "0%",
          opacity: isProfileOpen ? 0 : 1,
        }}
        transition={{
          type: "tween",
          duration: 0.15,
          ease: "easeInOut",
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search for users"
        />
        <div className="overflow-y-auto min-h-0 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center px-2 py-4">
              <Loader className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : search.length === 0 ? (
            <>
              {trendingResults && trendingResults.length > 0 && (
                <h2 className="text-sm font-medium mb-3 text-gray-300">
                  Trending users
                </h2>
              )}
              {trendingResults?.map((user) => (
                <UserResult
                  key={user.fid}
                  user={user}
                  onClick={() => handleUserClick(user, true)}
                />
              ))}
            </>
          ) : (
            results?.map((user) => (
              <UserResult
                key={user.fid}
                user={user}
                onClick={handleUserClick}
              />
            ))
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {isProfileOpen && selectedUser && (
          <Profile
            user={selectedUser}
            onClose={() => setIsProfileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

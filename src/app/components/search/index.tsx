"use client";

import { useState } from "react";
import { SearchBar } from "../common/search-bar";
import { useFrame } from "@/providers/FrameProvider";
import useSWR from "swr";
import { User, Channel } from "@neynar/nodejs-sdk/build/api";
import { Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Profile } from "../profile";
import { useAnalytics } from "@/hooks/useAnalytics";
import { UserResult } from "./components/user-result";
import { ChannelResult } from "./components/channel-result";
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
      targetId: user.fid,
    });

    if (!fromTrending)
      fetch("/api/track/search", {
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

  const handleChannelClick = (channel: Channel) => {
    // TODO: open channel profile

    trackEvent("opened_from_search", {
      type: "channel",
      targetId: channel.id,
    });

    fetch("/api/track/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        type: "channel",
        queryId: channel.id,
      }),
    });
  };

  const { data: userResults, isLoading: isUserResultsLoading } = useSWR<User[]>(
    sessionToken && search.trim().length > 0
      ? `/api/search/users?query=${encodeURIComponent(search)}&limit=3`
      : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: channelResults, isLoading: isChannelResultsLoading } = useSWR<
    Channel[]
  >(
    sessionToken && search.trim().length > 0
      ? `/api/search/channels?query=${encodeURIComponent(search)}&limit=3`
      : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: trendingUserResults, isLoading: isTrendingUserResultsLoading } =
    useSWR<User[]>(
      sessionToken ? `/api/trending/users?limit=3` : null,
      (url: string) => fetcher(url, sessionToken!),
      {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        keepPreviousData: true,
      }
    );

  const isLoading =
    isUserResultsLoading ||
    isChannelResultsLoading ||
    isTrendingUserResultsLoading;

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
          placeholder="Search for users and channels"
        />
        <div className="overflow-y-auto min-h-0 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center px-2 py-4">
              <Loader className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : search.length === 0 ? (
            <>
              {trendingUserResults && trendingUserResults.length > 0 && (
                <h2 className="text-sm font-medium mb-3 text-gray-300">
                  Trending users
                </h2>
              )}
              {trendingUserResults?.map((user) => (
                <UserResult
                  key={user.fid}
                  user={user}
                  onClick={() => handleUserClick(user, true)}
                />
              ))}
            </>
          ) : (
            <>
              {userResults && userResults.length > 0 && (
                <>
                  <h2 className="text-sm font-medium mb-3 text-gray-300">
                    Users
                  </h2>
                  {userResults.map((user) => (
                    <UserResult
                      key={user.fid}
                      user={user}
                      onClick={handleUserClick}
                    />
                  ))}
                </>
              )}
              {channelResults && channelResults.length > 0 && (
                <>
                  <h2 className="text-sm font-medium mb-3 mt-6 text-gray-300">
                    Channels
                  </h2>
                  {channelResults.map((channel) => (
                    <ChannelResult
                      key={channel.id}
                      channel={channel}
                      onClick={handleChannelClick}
                    />
                  ))}
                </>
              )}
            </>
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

import { useState } from "react";
import { SearchBar } from "../common/search-bar";
import { useFrame } from "@/providers/FrameProvider";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api";
import { Avatar } from "../video/components/avatar";
import { Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Profile } from "../profile";
import { useAnalytics } from "@/hooks/useAnalytics";

export const SearchPage = () => {
  const [search, setSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { trackEvent } = useAnalytics();

  const { context, sessionToken } = useFrame();

  const searchKey =
    search.trim().length > 0 && context?.user?.fid
      ? `/api/search/users?query=${encodeURIComponent(search)}&viewerFid=${
          context.user.fid
        }`
      : null;

  const { data: results, isLoading } = useSWR<User[]>(
    searchKey,
    (url: string) => fetch(url).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

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
          ) : (
            search.length > 0 &&
            results?.map((user) => (
              <div
                key={user.fid}
                className="flex items-center justify-between p-2 gap-3 hover:bg-accent/40 rounded hover:bg-gray-900 cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  setIsProfileOpen(true);

                  trackEvent("opened_from_search", {
                    type: "user",
                    targetFid: user.fid,
                  });

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
                }}
              >
                <Avatar
                  user={{
                    fid: user.fid,
                    username: user.username,
                    displayName: user.display_name || user.username,
                    pfpUrl: user.pfp_url || "",
                  }}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {user.display_name || user.username}
                  </span>
                  <span className="text-sm text-gray-300 truncate">
                    @{user.username}
                  </span>
                </div>
              </div>
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

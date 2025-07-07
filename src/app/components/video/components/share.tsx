import { FarcasterIcon } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import sdk from "@farcaster/frame-sdk";
import { appUrl } from "@/constants";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api/models/user";
import { useFrame } from "@/providers/FrameProvider";
import { Loader } from "lucide-react";
import { Avatar } from "./avatar";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SearchBar } from "../../common/search-bar";
import { fetcher } from "@/utils/fetcher";

interface ShareProps {
  children: React.ReactNode;
  data: VideoData;
}

export const Share = ({ children, data }: ShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { context, sessionToken } = useFrame();
  const { trackEvent } = useAnalytics();

  const { data: friends, isLoading: isFriendsLoading } = useSWR<User[]>(
    sessionToken ? `/api/friends` : null,
    (url: string) => fetcher(url, sessionToken!),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Fetch users based on the search query
  const searchKey =
    search.trim().length > 0 && sessionToken
      ? `/api/search/users?query=${encodeURIComponent(search)}`
      : null;

  const { data: searchResults, isLoading: isSearching } = useSWR<User[]>(
    searchKey,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const isLoading = useMemo(() => {
    return isFriendsLoading || isSearching;
  }, [isFriendsLoading, isSearching]);

  const users = useMemo(() => {
    if (search.trim().length === 0) {
      return friends;
    } else if (searchResults && searchResults.length > 0) {
      return searchResults;
    } else if (friends && friends.length > 0) {
      return friends;
    }
    return [];
  }, [searchResults, friends, search]);

  const trackShare = async (recipient: User) => {
    if (!context?.user?.fid) return;

    try {
      await fetch("/api/track/share", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          targetFid: recipient.fid.toString(),
        }),
      });

      trackEvent("shared_post_dc", {
        user: context.user.username,
        recipient: recipient.username,
        castHash: data.id,
      });
    } catch (error) {
      console.error("Failed to track share:", error);
    }
  };

  return (
    <div onDoubleClick={(e) => e.stopPropagation()}>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="h-[55vh] w-full flex flex-col pb-4 px-4">
          <DrawerHeader>
            <DrawerTitle>Share</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col w-full h-full overflow-hidden">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search"
              maxLength={255}
              className="mb-4"
            />
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="flex justify-center items-center px-2 py-4">
                  <Loader className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (
                users?.map((user) => (
                  <div
                    key={user.fid}
                    className="flex items-center justify-between py-2 px-1 gap-3 hover:bg-accent/40 rounded-md"
                  >
                    <Avatar
                      user={{
                        fid: user.fid,
                        username: user.username,
                        displayName: user.display_name || user.username,
                        pfpUrl: user.pfp_url || "",
                      }}
                      onClick={() => sdk.actions.viewProfile({ fid: user.fid })}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold truncate">
                        {user.display_name || user.username}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondaryAction"
                      className="gap-2"
                      onClick={() => {
                        trackShare(user);
                        sdk.actions.openUrl(
                          `https://farcaster.xyz/~/inbox/create/${
                            user.fid
                          }?text=${encodeURIComponent(
                            `Check out this video by @${data.author.username} on /dash!\n\n${appUrl}/share/${data.id}?utm_source=dc`
                          )}`
                        );
                      }}
                    >
                      Send
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="w-full my-4 bg-background">
              <Button
                variant="action"
                className="w-full text-md [&_svg]:!size-5 gap-2"
                onClick={async () => {
                  const result = await sdk.actions.composeCast({
                    text: `Check out this video by @${data.author.username} on /dash!`,
                    embeds: [
                      `${appUrl}/share/${data.id}?utm_source=share_post`,
                    ],
                  });

                  if (result && result.cast) {
                    trackEvent("shared_post_cast", {
                      user: context?.user.username,
                      postCastHash: data.id,
                      shareCastHash: result.cast.hash,
                    });
                  }
                }}
              >
                <FarcasterIcon className="w-5 h-5" />
                Share on Farcaster
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

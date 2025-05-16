import { FarcasterIcon } from "@/assets/icons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
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
import { Input } from "@/components/ui/input";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api/models/user";
import { useFrame } from "@/providers/FrameProvider";
import { Loader } from "lucide-react";
import { Avatar } from "./avatar";

interface ShareProps {
  children: React.ReactNode;
  post: Post;
}

export const Share = ({ children, post }: ShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { context } = useFrame();

  const { data: friends, isLoading: isFriendsLoading } = useSWR<User[]>(
    context?.user?.fid ? `/api/friends/${context.user.fid}` : null,
    (url: string) => fetch(url).then((res) => res.json()),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Fetch users based on the search query
  const searchKey =
    search.trim().length > 0 && context?.user?.fid
      ? `/api/search/users?query=${encodeURIComponent(search)}&viewerFid=${
          context.user.fid
        }`
      : null;

  const { data: searchResults, isLoading: isSearching } = useSWR<User[]>(
    searchKey,
    (url: string) => fetch(url).then((res) => res.json()),
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

  const trackShare = async (recipientFid: string) => {
    if (!context?.user?.fid) return;

    try {
      await fetch("/api/shares/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderFid: context.user.fid.toString(),
          recipientFid,
        }),
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
            <DrawerTitle>Share Dash</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col w-full h-full overflow-hidden">
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={255}
                placeholder="Search"
                className="w-full rounded pl-9"
              />
            </div>
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
                      imageUrl={user.pfp_url ?? ""}
                      altText={user.username}
                      fid={user.fid}
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
                        trackShare(user.fid.toString());
                        sdk.actions.openUrl(
                          `https://warpcast.com/~/inbox/create/${
                            user.fid
                          }?text=${encodeURIComponent(
                            `Check out this video by @${post.author.username} on Dash!\n\n${appUrl}/share/${post.id}`
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
                onClick={() =>
                  sdk.actions.composeCast({
                    text: `Check out this video by @${post.author.username} on Dash!`,
                    embeds: [`${appUrl}/share/${post.id}`],
                  })
                }
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

import { FarcasterIcon } from "@/assets/icons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import sdk from "@farcaster/frame-sdk";
import { appUrl } from "@/constants";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import useSWR from "swr";
import { User } from "@neynar/nodejs-sdk/build/api/models/user";
import { useFrame } from "@/providers/FrameProvider";

interface ShareProps {
  children: React.ReactNode;
  post: Post;
}

export const Share = ({ children, post }: ShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { context } = useFrame();

  const { data: friends, isLoading } = useSWR<User[]>(
    context?.user?.fid ? `/api/friends/${context.user.fid}` : null,
    (url: string) => fetch(url).then((res) => res.json())
  );

  // Filter friends according to search query
  const filteredFriends = friends?.filter((friend) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      friend.username.toLowerCase().includes(query) ||
      (friend.display_name?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <div onDoubleClick={(e) => e.stopPropagation()}>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="h-[50vh] w-full flex flex-col pb-4 px-4">
          <div className="flex flex-col w-full h-full gap-4 overflow-hidden">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={255}
                placeholder="Search"
                className="w-full rounded pl-9"
              />
            </div>
            <div className="flex-1 overflow-y-auto max-h-[calc(70vh-180px)]">
              {isLoading && (
                <p className="text-sm text-muted-foreground px-2 py-4">
                  Loading…
                </p>
              )}
              {!isLoading &&
                (!filteredFriends || filteredFriends.length === 0) && (
                  <p className="text-sm text-muted-foreground px-2 py-4">
                    No friends found
                  </p>
                )}

              {!isLoading &&
                filteredFriends?.map((friend) => (
                  <div
                    key={friend.fid}
                    className="flex items-center justify-between py-2 px-1 gap-3 hover:bg-accent/40 rounded-md"
                  >
                    <img
                      src={friend.pfp_url ?? "https://placehold.co/40"}
                      alt={friend.username}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold truncate">
                        {friend.display_name || friend.username}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        @{friend.username}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondaryAction"
                      className="gap-2"
                      onClick={() =>
                        sdk.actions.openUrl(
                          `https://warpcast.com/~/inbox/create/${
                            friend.fid
                          }?text=${encodeURIComponent(
                            `Check out this video by @${post.author.username} on Dash!\n\n${appUrl}/share/${post.id}`
                          )}`
                        )
                      }
                    >
                      Send
                    </Button>
                  </div>
                ))}
            </div>
            <div className="w-full sticky bottom-0 bg-background pb-2">
              <Button
                variant="action"
                className="w-full text-md [&_svg]:!size-5 gap-2"
                onClick={() => {
                  sdk.actions.composeCast({
                    text: `Check out this video by @${post.author.username} on Dash!`,
                    embeds: [`${appUrl}/share/${post.id}`],
                  });
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

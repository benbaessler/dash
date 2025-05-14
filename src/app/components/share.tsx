import { FarcasterIcon } from "@/assets/icons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import sdk from "@farcaster/frame-sdk";
import { appUrl } from "@/constants";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ShareProps {
  children: React.ReactNode;
  post: Post;
}

export const Share = ({ children, post }: ShareProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div onDoubleClick={(e) => e.stopPropagation()}>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="h-[45vh] w-full flex flex-col pb-4 px-4">
          <DrawerHeader>
            <DrawerTitle>Send to</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col w-full h-full gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
              <Input
                maxLength={255}
                placeholder="Search"
                className="w-full rounded pl-9"
              />
            </div>
            <div className="mt-auto w-full">
              <Button
                variant="action"
                className="w-full gap-2"
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

import React, { useMemo, useState } from "react";
import { useFrame } from "@/providers/FrameProvider";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/utils/fetcher";
import { Loader } from "lucide-react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Channel } from "@neynar/nodejs-sdk/build/api/models/channel";

interface Props {
  activeFeed: string;
  setActiveFeed: (feed: string) => void;
  onAddChannel?: () => void;
}

export const FeedTabs = ({ activeFeed, setActiveFeed }: Props) => {
  const { sessionToken } = useFrame();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useSWR(
    sessionToken ? "/api/trending/feeds" : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: searchResults, isLoading: isSearchLoading } = useSWR(
    searchQuery
      ? `/api/search/channels?query=${encodeURIComponent(searchQuery)}&limit=5`
      : null,
    (url: string) => fetcher(url, sessionToken!),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const tabs = useMemo(() => ["Explore", ...(data || [])], [data]);

  const displayOptions = useMemo(() => {
    if (searchQuery) {
      return searchResults?.map((channel: Channel) => `/${channel.id}`) || [];
    } else {
      return tabs;
    }
  }, [tabs, searchResults, searchQuery]);

  const displayedFeedName =
    tabs.find(
      (tab: string) => tab.toLowerCase() === activeFeed.toLowerCase()
    ) || activeFeed;

  const handleSelect = async (feed: string) => {
    setActiveFeed(feed.toLowerCase());
    setOpen(false);
    setSearchQuery("");

    if (feed !== "Explore") {
      fetch(`/api/track/feed`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          channelId: feed.replace("/", ""),
        }),
      });

      mutate("/api/trending/feeds");
    }
  };

  return (
    <div className="absolute top-3 left-5 z-[9] drop-shadow-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="combobox"
            aria-expanded={open}
            className="flex items-center cursor-pointer gap-2 font-semibold text-white"
            tabIndex={0}
            onClick={() => setOpen(!open)}
          >
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              <CaretDownIcon size={20} weight="bold" />
            </motion.div>
            <span className="truncate">{displayedFeedName}</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-black/10 backdrop-blur-sm rounded-lg border-none mt-1 ml-3 drop-shadow-sm">
          <Command className="bg-transparent">
            <CommandInput
              autoFocus={false}
              placeholder="Search channels"
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="text-white text-md focus:ring-0 focus:outline-none placeholder:text-white/70"
            />
            <CommandList className="text-md p-1">
              {isSearchLoading || isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader className="h-4 w-4 animate-spin text-white" />
                </div>
              ) : (
                <>
                  <CommandEmpty className="px-3 py-3">
                    No channels found
                  </CommandEmpty>
                  <CommandGroup>
                    {displayOptions
                      .filter(
                        (option: string) => option.toLowerCase() !== activeFeed
                      )
                      .map((option: string) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={handleSelect}
                          className="text-white hover:text-white/80 hover:bg-black/40 py-2 rounded-md cursor-pointer"
                        >
                          {option}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

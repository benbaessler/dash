import React, { useMemo, useState } from "react";
import { useFrame } from "@/providers/FrameProvider";
import useSWR from "swr";
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

interface Props {
  activeFeed: string;
  setActiveFeed: (feed: string) => void;
  onAddChannel?: () => void;
}

export const FeedTabs = ({
  activeFeed,
  setActiveFeed,
}: Props) => {
  const { sessionToken } = useFrame();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data } = useSWR(
    sessionToken ? "/api/feed/saved" : null,
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
      ? `/api/search/channels?query=${encodeURIComponent(searchQuery)}&limit=3`
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
      return searchResults?.map((channel: any) => channel.id) || [];
    } else {
      return tabs;
    }
  }, [tabs, searchResults, searchQuery]);

  const displayedFeedName = tabs.find(
    (tab: string) => tab.toLowerCase() === activeFeed.toLowerCase()
  ) || activeFeed;

  return (
    <div className="absolute top-3 left-5 z-[9] drop-shadow-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="combobox"
            aria-expanded={open}
            className="flex items-center cursor-pointer gap-2 font-medium"
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
        <PopoverContent className="w-[200px] p-0 bg-slate-900 rounded-lg border-none mt-1 ml-3">
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Search channels"
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="text-white focus:ring-0 focus:outline-none placeholder:text-gray-400"
            />
            <CommandList className="text-sm p-1">
              {isSearchLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader className="h-4 w-4 animate-spin text-white" />
                </div>
              ) : (
                <>
                  <CommandEmpty className="p-2">No channels found</CommandEmpty>
                  <CommandGroup>
                    {displayOptions
                      .filter((option: string) => option.toLowerCase() !== activeFeed)
                      .map((option: string) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={(currentValue) => {
                            setActiveFeed(currentValue.toLowerCase());
                            setOpen(false);
                          }}
                          className="text-white hover:bg-slate-800 py-2 rounded-md cursor-pointer"
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

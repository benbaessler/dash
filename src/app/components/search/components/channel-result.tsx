import { Channel } from "@neynar/nodejs-sdk/build/api";

interface Props {
  channel: Channel;
  onClick: (channel: Channel) => void;
}

export const ChannelResult = ({ channel, onClick }: Props) => {
  return (
    <div
      className="flex items-center justify-between p-2 gap-3 hover:bg-accent/40 rounded hover:bg-gray-900 cursor-pointer"
      onClick={() => onClick(channel)}
    >
      <div className="flex-shrink-0">
        <img
          src={channel.image_url || "/fallback-pfp.png"}
          alt={channel.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-semibold truncate">
          {channel.name}
        </span>
        <span className="text-sm text-gray-300 truncate">/{channel.id}</span>
      </div>
    </div>
  );
}; 
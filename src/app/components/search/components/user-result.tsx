import { User } from "@neynar/nodejs-sdk/build/api";
import { Avatar } from "@/app/components/video/components/avatar";

interface Props {
  user: User;
  onClick: (user: User) => void;
}

export const UserResult = ({ user, onClick }: Props) => {
  return (
    <div
      className="flex items-center justify-between p-2 gap-3 hover:bg-accent/40 rounded hover:bg-gray-900 cursor-pointer"
      onClick={() => onClick(user)}
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
        <span className="text-sm text-gray-300 truncate">@{user.username}</span>
      </div>
    </div>
  );
};

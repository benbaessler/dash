interface VideoData {
  id: string;
  channelId?: string;
  text: string;
  video_url: string;
  duration?: number;
  likeCount: number;
  recastCount: number;
  commentCount: number;
  timestamp: number;
  viewed?: boolean;
  author: {
    fid: number;
    displayName: string;
    username: string;
    pfpUrl: string;
  };
  viewerContext?: {
    liked: boolean;
    recasted: boolean;
  };
}

interface PromotionData {
  type: "add-frame" | "share-app" | "join-channel";
  index: number;
}

type FeedItem = VideoData | PromotionData;

type Tab = "home" | "search" | "profile";

interface CommentData {
  hash: string;
  author: {
    fid: number;
    pfp_url: string;
    display_name: string;
    username: string;
  };
  timestamp: string;
  text: string;
  reactions: {
    likes_count: number;
  };
  replies: {
    count: number;
  };
  direct_replies?: CommentData[];
  isExpanded?: boolean;
}
interface Post {
  id: string;
  text: string;
  video_url?: string;
  likeCount: number;
  recastCount: number;
  commentCount: number;
  timestamp: number;
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

interface CommentData {
  hash: string;
  author: {
    fid: number;
    pfp_url: string;
    display_name: string;
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
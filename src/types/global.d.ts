interface Post {
  id: string;
  text: string;
  video_url: string;
  likeCount: number;
  recastCount: number;
  timestamp: number;
  author: {
    fid: number;
    displayName: string;
    username: string;
    pfpUrl: string;
  };
}

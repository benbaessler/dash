export const insertPromotions = (
  videos: VideoData[],
  promotions: PromotionData[]
): FeedItem[] => {
  const result: FeedItem[] = [];
  let videoIndex = 0;

  if (videos.length < 15) return videos;

  const promotionMap = new Map(promotions.map((p) => [p.index, p]));
  const maxIndex = Math.max(
    videos.length - 1,
    Math.max(...promotions.map((p) => p.index))
  );

  for (let i = 0; i <= maxIndex; i++) {
    if (promotionMap.has(i)) {
      result.push(promotionMap.get(i)!);
    } else if (videoIndex < videos.length) {
      result.push(videos[videoIndex]);
      videoIndex++;
    }
  }

  while (videoIndex < videos.length) {
    result.push(videos[videoIndex]);
    videoIndex++;
  }

  return result;
};

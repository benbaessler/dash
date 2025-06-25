"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Virtual } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/virtual";
import "swiper/css/pagination";
import { Promotion } from "../promotion";
import { VideoItem } from "./video-item";
import { useFeed } from "@/hooks";
import { useState } from "react";

export function FeedView() {
  const { feed, fetchMore } = useFeed();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Swiper
      speed={200}
      direction="vertical"
      followFinger={false}
      virtual
      touchStartPreventDefault={false}
      touchMoveStopPropagation={false}
      touchReleaseOnEdges={true}
      threshold={0}
      longSwipesRatio={0.3}
      longSwipesMs={150}
      mousewheel={{
        forceToAxis: true,
        thresholdDelta: 10,
        thresholdTime: 400,
        releaseOnEdges: true,
      }}
      modules={[Mousewheel, Virtual]}
      onReachEnd={fetchMore}
      className="h-screen w-full"
      onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
    >
      {(feed || []).map((item, index) => (
        <SwiperSlide key={index} virtualIndex={index}>
          {"type" in item ? (
            <Promotion type={item.type} />
          ) : (
            <VideoItem
              data={item as VideoData}
              active={activeIndex === index}
              // Preload next 3 videos
              preload={Math.abs(index - activeIndex) <= 3}
            />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

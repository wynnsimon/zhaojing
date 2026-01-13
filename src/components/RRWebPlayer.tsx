import { useEffect, useRef } from "react";
import rrwebPlayer from "rrweb-player";
import { type eventWithTime } from "@rrweb/types";
import "rrweb-player/dist/style.css";

interface RRWebPlayerProps {
  events: eventWithTime[];
}

export const RRWebPlayer = ({ events }: RRWebPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<rrwebPlayer | null>(null);

  useEffect(() => {
    if (!containerRef.current || events.length === 0) return;

    // 清理旧的播放器
    if (playerRef.current) {
      playerRef.current.pause();
      containerRef.current.innerHTML = "";
    }

    // 创建新播放器
    playerRef.current = new rrwebPlayer({
      target: containerRef.current,
      props: {
        events,
        autoPlay: false,
        width: 1024,
        height: 576,
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    };
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        请选择一个录制记录
      </div>
    );
  }

  return (
    <div className="w-full h-full flex justify-center overflow-auto">
      <div ref={containerRef} className="inline-flex" />
    </div>
  );
};

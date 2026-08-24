"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const walkFrames = [1, 2, 3];
const idleFrames = [4, 5, 4, 6, 4];

export default function WalkingDaifu() {
  const pathname = usePathname();
  const [position, setPosition] = useState({ x: 8, y: 78 });
  const [direction, setDirection] = useState(1);
  const [moving, setMoving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [duration, setDuration] = useState(5);
  const positionRef = useRef(position);

  useEffect(() => { positionRef.current = position; }, [position]);

  useEffect(() => {
    if (paused) return;
    let arrivalTimer: ReturnType<typeof setTimeout>;
    let departureTimer: ReturnType<typeof setTimeout>;
    const travel = () => {
      const current = positionRef.current;
      const next = { x: 8 + Math.random() * 84, y: 28 + Math.random() * 58 };
      const distance = Math.hypot(next.x - current.x, next.y - current.y);
      const seconds = Math.max(3.5, Math.min(8, distance / 10));
      setDirection(next.x >= current.x ? -1 : 1);
      setDuration(seconds);
      setMoving(true);
      setPosition(next);
      arrivalTimer = setTimeout(() => {
        setMoving(false);
        departureTimer = setTimeout(travel, 2400 + Math.random() * 3000);
      }, seconds * 1000);
    };
    departureTimer = setTimeout(travel, 1200);
    return () => { clearTimeout(arrivalTimer); clearTimeout(departureTimer); };
  }, [paused]);

  useEffect(() => {
    const frames = moving ? walkFrames : idleFrames;
    setFrameIndex(0);
    if (paused) return;
    const timer = setInterval(() => setFrameIndex((index) => (index + 1) % frames.length), moving ? 190 : 650);
    return () => clearInterval(timer);
  }, [moving, paused]);

  if (pathname.startsWith("/admin")) return null;
  const frames = moving ? walkFrames : idleFrames;
  const frame = paused ? 4 : frames[frameIndex % frames.length];

  return <button type="button" onClick={() => setPaused((value) => !value)} className="daifu-walker" style={{ left: `${position.x}%`, top: `${position.y}%`, transitionDuration: paused ? "0s" : `${duration}s` }} aria-label={paused ? "讓大福雞繼續活動" : "讓大福雞停一下"} title={paused ? "點一下繼續活動" : "點一下停住大福雞"}>
    <span className={`daifu-character ${moving ? "is-walking" : "is-idle"}`} style={{ transform: `scaleX(${direction})` }}>
      <Image src={`/daifu-frames/frame-${frame}.png`} alt="" width={512} height={512} className="h-auto w-[88px] drop-shadow-[0_5px_0_rgba(23,21,18,.22)] md:w-[124px]" unoptimized/>
    </span>
  </button>;
}

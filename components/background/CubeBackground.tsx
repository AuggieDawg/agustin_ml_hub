"use client";

// components/background/CubeBackground.tsx
import dynamic from "next/dynamic";

const CubeBackgroundCanvas = dynamic(() => import("./CubeBackgroundCanvas"), {
  ssr: false,
});

export function CubeBackground() {
  return <CubeBackgroundCanvas />;
}
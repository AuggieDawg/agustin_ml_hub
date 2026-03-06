"use client";

// components/background/CubeBackgroundCanvas.tsx
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

function RotatingCube() {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.25;
    ref.current.rotation.y += delta * 0.35;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      <meshStandardMaterial metalness={0.6} roughness={0.25} />
    </mesh>
  );
}

export default function CubeBackgroundCanvas() {
  return (
    <div className="fixed inset-0 -z-10" style={{ pointerEvents: "none" }}>
      <Canvas
        className="!fixed !inset-0"
        dpr={[1, 2]}
        frameloop="always"
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4], fov: 50 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <RotatingCube />
      </Canvas>
    </div>
  );
}
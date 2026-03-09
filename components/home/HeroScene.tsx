"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

type HeroSceneProps = {
  scrollK?: number;
};

type RingSpec = {
  radius: number;
  tube: number;
  yOffset: number;
  phase: number;
  speed: number;
  color: string;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function SceneContent({ scrollK = 0 }: HeroSceneProps) {
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);

  const rings: RingSpec[] = useMemo(
    () => [
      {
        radius: 1.6,
        tube: 0.05,
        yOffset: -1.22,
        phase: 0.0,
        speed: 0.85,
        color: "#2b63ff",
      },
      {
        radius: 1.36,
        tube: 0.048,
        yOffset: -1.18,
        phase: 1.2,
        speed: 1.0,
        color: "#20d6a4",
      },
      {
        radius: 1.14,
        tube: 0.046,
        yOffset: -1.14,
        phase: 2.4,
        speed: 0.92,
        color: "#4a7cff",
      },
      {
        radius: 0.96,
        tube: 0.044,
        yOffset: -1.1,
        phase: 3.6,
        speed: 1.08,
        color: "#32d1b0",
      },
      {
        radius: 0.8,
        tube: 0.042,
        yOffset: -1.06,
        phase: 4.8,
        speed: 0.98,
        color: "#7aa2ff",
      },
    ],
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const k = clamp01(scrollK);

    if (cubeRef.current) {
      cubeRef.current.rotation.y = t * 0.28 + k * 1.1;
      cubeRef.current.rotation.x = 0.12 - k * 0.2;
    }

    if (coreRef.current) {
      const s = 0.4 + Math.sin(t * 1.25) * 0.02;
      coreRef.current.scale.setScalar(s);
    }

    for (let i = 0; i < rings.length; i += 1) {
      const ref = ringRefs.current[i];
      if (!ref) continue;

      const r = rings[i];
      const bob = Math.sin(t * r.speed + r.phase) * 0.03;

      ref.position.y = r.yOffset + bob;
      ref.rotation.y = -(t * 0.25) + i * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#d8e6ff" />
      <pointLight position={[-3, 2, 3]} intensity={1.6} color="#5aa3ff" />
      <pointLight position={[0, -1, 1]} intensity={1.2} color="#2bd3a8" />

      <Environment preset="city" />

      <Sparkles
        count={90}
        size={2.1}
        speed={0.45}
        opacity={0.65}
        scale={[9, 5, 7]}
        position={[0, 0.2, 0]}
        color="#d7e6ff"
      />

      {rings.map((r, i) => (
        <mesh
          key={`${r.radius}-${i}`}
          ref={(node) => {
            ringRefs.current[i] = node;
          }}
          position={[0, r.yOffset, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[r.radius, r.tube, 24, 120]} />
          <meshPhysicalMaterial
            color={r.color}
            emissive={r.color}
            emissiveIntensity={0.65}
            roughness={0.16}
            metalness={0.45}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
      ))}

      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.4}>
        <RoundedBox ref={cubeRef} args={[2.15, 2.15, 2.15]} radius={0.18} smoothness={4}>
          <meshPhysicalMaterial
            color="#c9dcff"
            transmission={0.9}
            thickness={1.4}
            roughness={0.06}
            metalness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.04}
            ior={1.22}
            transparent
            opacity={0.82}
          />
        </RoundedBox>
      </Float>

      <mesh ref={coreRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial
          color="#cfe3ff"
          emissive="#70b6ff"
          emissiveIntensity={1.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      <EffectComposer>
        <Bloom intensity={1.35} luminanceThreshold={0.15} luminanceSmoothing={0.9} />
        <Vignette eskil={false} offset={0.18} darkness={0.95} />
      </EffectComposer>
    </>
  );
}

export default function HeroScene({ scrollK = 0 }: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <SceneContent scrollK={scrollK} />
    </Canvas>
  );
}
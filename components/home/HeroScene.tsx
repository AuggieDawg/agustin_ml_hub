"use client";

/**
 * components/home/HeroScene.tsx
 *
 * Fixes:
 * - Registers custom shader material with R3F via extend({ RingGradientMaterial })
 *   so <ringGradientMaterial /> works.
 *
 * Features:
 * - Black space vibe (canvas is transparent; page controls background)
 * - Glass cube
 * - 5 HORIZONTAL rings (flat halos) hovering at cube base
 * - True blue->green gradient shader on rings (angle-based)
 * - Starfield particles (same size)
 * - Lens flare + glow streak sprites (additive) + Bloom for cinematic streaks
 */

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Environment, Float, RoundedBox, Sparkles, shaderMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

// ---------------- Types ----------------
type HeroSceneProps = { scrollK: number };

type RingSpec = {
  radius: number;
  tube: number;
  yOffset: number;
  phase: number;
  speed: number;
};

// ---------------- Helpers ----------------
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

// ---------------- Custom Gradient Material ----------------
// NOTE: This returns a *class* that extends THREE.ShaderMaterial.
const RingGradientMaterial = shaderMaterial(
  {
    colorA: new THREE.Color("#3f6bff"),
    colorB: new THREE.Color("#20d6a4"),
    emissiveStrength: 0.22,
  },
  // vertex shader
  `
  varying vec3 vPos;
  varying vec3 vNormal;

  void main() {
    vPos = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment shader
  `
  uniform vec3 colorA;
  uniform vec3 colorB;
  uniform float emissiveStrength;

  varying vec3 vPos;
  varying vec3 vNormal;

  float fresnel(vec3 normal, vec3 viewDir) {
    float f = 1.0 - max(dot(normalize(normal), normalize(viewDir)), 0.0);
    return pow(f, 2.5);
  }

  void main() {
    // Use XZ plane for angle around ring (works well when ring is horizontal)
    float ang = atan(vPos.z, vPos.x);               // -pi..pi
    float t = (ang + 3.14159265) / (6.2831853);     // 0..1

    vec3 base = mix(colorA, colorB, t);

    // Subtle top highlight using normal Y (gives “machined” sleekness)
    float top = clamp((vNormal.y * 0.5) + 0.5, 0.0, 1.0);
    vec3 lit = base * (0.78 + 0.42 * top);

    // Fresnel edge sparkle
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // approximation; bloom does the heavy lifting
    float f = fresnel(vNormal, viewDir);

    vec3 emissive = base * emissiveStrength;

    vec3 finalCol = lit + emissive + (base * f * 0.55);

    gl_FragColor = vec4(finalCol, 1.0);
  }
  `
);

// Register the material class so we can use <ringGradientMaterial /> in JSX.
extend({ RingGradientMaterial });

// Tell TS about our JSX intrinsic element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ringGradientMaterial: any;
    }
  }
}

// ---------------- Lens flare texture ----------------
function makeFlareTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  // Core glow
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, "rgba(200,220,255,0.95)");
  grad.addColorStop(0.18, "rgba(120,170,255,0.55)");
  grad.addColorStop(0.6, "rgba(60,120,255,0.12)");
  grad.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Horizontal streak
  const streak = ctx.createLinearGradient(0, size / 2, size, size / 2);
  streak.addColorStop(0.0, "rgba(0,0,0,0)");
  streak.addColorStop(0.42, "rgba(160,220,255,0.10)");
  streak.addColorStop(0.50, "rgba(220,255,245,0.40)");
  streak.addColorStop(0.58, "rgba(160,220,255,0.10)");
  streak.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = streak;
  ctx.fillRect(0, size / 2 - 3, size, 6);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ---------------- Scene ----------------
function SceneContent({ scrollK }: HeroSceneProps) {
  const cubeRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const flareRefA = useRef<THREE.Sprite>(null);
  const flareRefB = useRef<THREE.Sprite>(null);

  const rings: RingSpec[] = useMemo(
    () => [
      { radius: 1.60, tube: 0.050, yOffset: -1.22, phase: 0.0, speed: 0.85 },
      { radius: 1.36, tube: 0.048, yOffset: -1.18, phase: 1.2, speed: 1.00 },
      { radius: 1.14, tube: 0.046, yOffset: -1.14, phase: 2.4, speed: 0.92 },
      { radius: 0.96, tube: 0.044, yOffset: -1.10, phase: 3.6, speed: 1.08 },
      { radius: 0.80, tube: 0.042, yOffset: -1.06, phase: 4.8, speed: 0.98 },
    ],
    []
  );

  const flareTexture = useMemo(() => makeFlareTexture(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const k = clamp01(scrollK);

    // Cube rotation: scroll + time
    if (cubeRef.current) {
      cubeRef.current.rotation.y = t * 0.25 + k * 1.15;
      cubeRef.current.rotation.x = 0.16 - k * 0.22;
    }

    // Rings: float a bit + slow spin
    for (let i = 0; i < rings.length; i++) {
      const ref = ringRefs.current[i];
      if (!ref) continue;

      const r = rings[i];
      const bob = Math.sin(t * r.speed + r.phase) * 0.03;
      ref.position.y = r.yOffset + bob;
      ref.rotation.y = -(t * 0.25) + i * 0.12;
    }

    // Lens flare sprites: follow slightly above cube center
    const pulse = 0.92 + Math.sin(t * 1.2) * 0.03;
    const baseScale = (1.15 + k * 0.35) * pulse;

    const worldPos = new THREE.Vector3(0, 0.35, 0.35);

    if (flareRefA.current) {
      flareRefA.current.position.copy(worldPos);
      flareRefA.current.scale.set(2.6 * baseScale, 0.55 * baseScale, 1);
    }
    if (flareRefB.current) {
      flareRefB.current.position.copy(worldPos);
      flareRefB.current.scale.set(1.4 * baseScale, 1.4 * baseScale, 1);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.40} />
      <directionalLight position={[4, 5, 3]} intensity={1.55} color={"#cfe0ff"} />
      <pointLight position={[-3, 2, -2]} intensity={1.0} color={"#7da0ff"} />
      <pointLight position={[2.5, -1.0, 2.0]} intensity={0.8} color={"#55ffcc"} />

      {/* Reflections */}
      <Environment preset="city" />

      {/* Stars */}
      <Sparkles
        count={260}
        speed={0.12}
        opacity={0.55}
        size={2.2} // same size
        scale={[18, 12, 18]}
        color={"#eaf0ff"}
      />

      <Float speed={0.85} rotationIntensity={0.12} floatIntensity={0.16}>
        {/* Rings: horizontal halos */}
        {rings.map((r, i) => (
          <mesh
            key={`ring-${i}`}
            ref={(node) => {
              if (node) ringRefs.current[i] = node;
            }}
            position={[0, r.yOffset, 0]}
            rotation={[Math.PI / 2, 0, 0]} // lay flat
          >
            <torusGeometry args={[r.radius, r.tube, 32, 220]} />

            {/* Use our registered custom shader material */}
            <ringGradientMaterial
              // keep A/B consistent, slightly vary emissive per ring for depth
              colorA={new THREE.Color("#142c7b")}
              colorB={new THREE.Color("#20d6a4")}
              emissiveStrength={0.18 + i * 0.02}
            />
          </mesh>
        ))}

        {/* Glass cube */}
        <RoundedBox args={[1.15, 1.15, 1.15]} radius={0.18} smoothness={10} ref={cubeRef}>
          <meshPhysicalMaterial
            color={"#9227bf55"}
            metalness={0.02}
            roughness={0.015}
            transmission={0.92}
            thickness={1.2}
            ior={1.52}
            clearcoat={1.0}
            clearcoatRoughness={0.035}
            emissive={"#5b7cff"}
            emissiveIntensity={0.05}
          />
        </RoundedBox>

        {/* Inner core glow */}
        <mesh>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshStandardMaterial
            color={"#6f88ff"}
            emissive={"#98b0ff"}
            emissiveIntensity={1.25}
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>

        {/* Lens flare streak (horizontal) */}
        <sprite ref={flareRefA}>
          <spriteMaterial
            map={flareTexture}
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color={new THREE.Color("#cfe0ff")}
          />
        </sprite>

        {/* Secondary flare core */}
        <sprite ref={flareRefB}>
          <spriteMaterial
            map={flareTexture}
            transparent
            opacity={0.28}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color={new THREE.Color("#55ffcc")}
          />
        </sprite>
      </Float>

      {/* Post FX */}
      <EffectComposer>
        <Bloom intensity={1.25} luminanceThreshold={0.12} luminanceSmoothing={0.88} />
        <Vignette eskil={false} offset={0.16} darkness={0.86} />
      </EffectComposer>
    </>
  );
}

export default function HeroScene({ scrollK }: HeroSceneProps) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0.15, 4.8], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <SceneContent scrollK={scrollK} />
      </Canvas>
    </div>
  );
}

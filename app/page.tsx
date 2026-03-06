// app/page.tsx
import { CubeBackground } from "@/components/background/CubeBackground";
import { HomePlaceholderSections } from "@/components/HomePlaceholderSections";

// KEEP your existing LandingHero import/path (example below)
import  LandingHero  from "@/components/home/LandingHero";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <CubeBackground />

      <div className="relative z-10">
        
        <LandingHero />

        <HomePlaceholderSections />
      </div>
    </main>
  );
}
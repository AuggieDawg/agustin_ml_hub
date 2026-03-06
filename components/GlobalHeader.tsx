// components/GlobalHeader.tsx
import Link from "next/link";

export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium hover:bg-white/10"
          aria-label="Go to Home"
        >
          ⬅ Home
        </Link>

        <nav className="flex items-center gap-2 text-xs text-white/70">
          {/* Optional: add links you commonly need */}
          {/* <Link href="/workbench" className="hover:text-white">Workbench</Link> */}
        </nav>
      </div>
    </header>
  );
}
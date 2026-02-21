/**
 * lib/tools/registry.ts
 *
 * Tool Registry = single source of truth for tool definitions.
 * This is the professional pattern that keeps UI consistent:
 * - public landing renders `visibility: "public"`
 * - owner portal renders all tools (public + owner)
 *
 * Later:
 * - add categories, icons, route paths, feature flags
 * - store tool metadata in DB if you want runtime management
 */

export type ToolVisibility = "public" | "owner";

export type ToolDefinition = {
  id: string;
  title: string;
  frontText: string;
  backText: string;
  visibility: ToolVisibility;
  href?: string; // optional: route for tool page (only set when the page exists)
  frontImageSrc?: string;
  backImageSrc?: string;
};

export const TOOL_REGISTRY: ToolDefinition[] = [
  /**
   * NEW: Dataset Profiler
   * - This is the first ML tool that exercises the clean architecture:
   *   Owner UI -> Next.js API gateway (auth + RBAC) -> FastAPI ML service -> results displayed
   * - We set href because the page exists:
   *   app/owner/tools/data-profiler/page.tsx
   */
  {
    id: "dataset-profiler",
    title: "Dataset Profiler",
    frontText: "Upload a CSV and get a quick dataset profile.",
    backText:
      "Runs in the FastAPI ML service via secure Next.js gateway (ADMIN only).",
    visibility: "owner",
    href: "/owner/tools/data-profiler",
    // Optional images (add later when you pick assets):
    // frontImageSrc: "/icons/profiler-front.png",
    // backImageSrc: "/icons/profiler-back.png",
  },

  {
    id: "feature-builder",
    title: "Feature Builder",
    frontText: "Create features from tabular data.",
    backText: "Transforms, pipelines, exports (owner-only at first).",
    visibility: "owner",
  },
  {
    id: "model-runner",
    title: "Model Runner",
    frontText: "Run trained models on new inputs.",
    backText: "Versioned inference, logs, and auditability (owner-only at first).",
    visibility: "owner",
    frontImageSrc: "/icons/csm_Statestik_900x600-pix_7211a37dba.webp",
  },
  {
    id: "experiment-tracker",
    title: "Experiment Tracker",
    frontText: "Track runs and metrics.",
    backText: "Compare experiments and keep history (owner-only at first).",
    visibility: "owner",
  },
  {
    id: "task-system",
    title: "Task System",
    frontText: "User-owned tasks (working now).",
    backText: "Auth + API + Postgres persistence + scoping by userId.",
    visibility: "public",
    href: "/portal", // public demo is via portal
    frontImageSrc: "/icons/IMG_2414.jpeg",
    backImageSrc: "/icons/illus1.jpg",
  },
];

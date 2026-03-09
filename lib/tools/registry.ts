export type ToolVisibility = "public" | "owner";

export type ToolDefinition = {
  id: string;
  title: string;
  frontText: string;
  backText: string;
  visibility: ToolVisibility;
  href?: string;
  frontImageSrc?: string;
  backImageSrc?: string;
};

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    id: "dataset-profiler",
    title: "Dataset Profiler",
    frontText: "Upload a CSV and get a quick dataset profile.",
    backText:
      "Runs through the ML service via a secure Next.js gateway (ADMIN only).",
    visibility: "owner",
    href: "/owner/tools/data-profiler",
  },
  {
    id: "feature-builder",
    title: "Feature Builder",
    frontText: "Create features from tabular data.",
    backText:
      "Transforms, pipelines, and exports for reusable ML workflows.",
    visibility: "owner",
  },
  {
    id: "model-runner",
    title: "Model Runner",
    frontText: "Run trained models on new inputs.",
    backText:
      "Versioned inference, logs, and auditability for production-minded ML.",
    visibility: "owner",
    frontImageSrc: "/icons/csm_Statestik_900x600-pix_7211a37dba.webp",
  },
  {
    id: "experiment-tracker",
    title: "Experiment Tracker",
    frontText: "Track runs and metrics.",
    backText:
      "Compare experiments and preserve model history over time.",
    visibility: "owner",
  },
  {
    id: "task-system",
    title: "Task System",
    frontText: "Client-facing tasks with persistence.",
    backText:
      "Auth + API + Postgres persistence with user-scoped ownership.",
    visibility: "public",
    href: "/client",
    frontImageSrc: "/icons/IMG_2414.jpeg",
    backImageSrc: "/icons/illus1.jpg",
  },
];
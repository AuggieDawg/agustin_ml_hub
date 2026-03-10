export type WorkbenchTaskStatus =
  | "Open"
  | "InProgress"
  | "Review"
  | "Completed"
  | "Overdue";

export type WorkbenchTaskPriority = "Low" | "Medium" | "High";

export type WorkbenchTaskDTO = {
  id: string;
  title: string;
  client: string;
  dueDate: string | null;
  assignee: string;
  status: WorkbenchTaskStatus;
  priority: WorkbenchTaskPriority;
  mapX: number;
  mapY: number;
};

export type WorkbenchTaskLinkDTO = {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
};

export type WorkbenchShellTabId =
  | "Workbench"
  | "Weekly"
  | "Timeline"
  | "Milestones"
  | "Notes";

export const DEFAULT_WORKBENCH_SHELL_TABS: WorkbenchShellTabId[] = [
  "Workbench",
  "Weekly",
  "Timeline",
  "Milestones",
  "Notes",
];
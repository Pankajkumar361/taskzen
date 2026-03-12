export type Priority = "high" | "medium" | "low";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskMeta {
  priority: Priority;
  category: string;
  tags: string[];
  deadline: string | null;
  color: string;
  subtasks: Subtask[];
  recurring: boolean;
}

export function defaultMeta(): TaskMeta {
  return {
    priority: "medium",
    category: "",
    tags: [],
    deadline: null,
    color: "#6366f1",
    subtasks: [],
    recurring: false,
  };
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
};

export const TASK_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#64748b",
];
